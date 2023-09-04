import { useWallet } from '../wallet-packages/react';
import { ethers } from 'ethers';
import { useState } from 'react';
import ensABI from '../utils/contract-abi/ens/controller.json';
import { EVMWallet } from '../wallet-packages/wallets/evm';
import { formatBytes32String } from 'ethers/lib/utils.js';
const ens_controller_address = "0x253553366Da8546fC250F225fe3d25d0C782303b";
const providerUrl_eth = "https://eth-rpc.gateway.pokt.network";

async function getAddressENS(domainName:string) {
    try{
        const provider = new ethers.providers.JsonRpcProvider(providerUrl_eth);
        const address = await provider.resolveName(domainName);
        return address;
    } catch (err) {
        throw err;
    }
}

const ModuleENS = ()=>{
    const wallet = useWallet();
    const [name, setName] = useState('alice.eth');    
    const [rentprice, setRentPrice] = useState(0);
    const [availableName, setAvailableName] = useState(false);
    const handleNameChange = (event: any) => {
        setName(event.target.value);
        setRentPrice(0);
        setAvailableName(false);
      };
    
    const processENSCheckValid = async(domainName: string) => {
        try {
            if(!availableName) {
                const result = await getAddressENS(domainName);
                if(result) {
                    alert(`${name} already registered with this address ${result}`);
                    setRentPrice(0);
                    setAvailableName(false);
                    return false; 
                } else {
                }
            }
            const provider = new ethers.providers.JsonRpcProvider(providerUrl_eth);
            const resultSwitchChain = await (wallet as EVMWallet).switchChain(1).then(()=>{
                return true;
            }).catch((err)=>{
                alert(`Something went error for switch to Ethereum mannet. Error: ${err}`);
                return false;
            });

            if(!resultSwitchChain) return;
            
            const signer = (wallet as EVMWallet).getSigner();
            const ensControllerContract = new ethers.Contract(ens_controller_address, ensABI, signer );
            
            // const resultCommit = await ensControllerContract.estimateGas.commit(formatBytes32String("dotlab"));
            // alert(`commit estimate gas ${resultCommit}`)
            // const addr = await signer.getAddress();
            const price = await ensControllerContract.rentPrice(domainName, 31536000);
            // const gas = await ensControllerContract.estimateGas.register(domainName, addr, 31536000, formatBytes32String("dotlab"), addr, [], true, 1 );
            setRentPrice(price[0]);
            setAvailableName(true);
            return true;
        } catch (err) {
            alert(err)
        }
    }
    const processENSRegister = async(domainName: string) => {
        try {
            const provider = new ethers.providers.JsonRpcProvider(providerUrl_eth);
            const resultSwitchChain = await (wallet as EVMWallet).switchChain(1).then(()=>{
                return true;
            }).catch((err)=>{
                alert(`Something went error for switch to Ethereum mannet. Error: ${err}`);
                return false;
            });

            if(!resultSwitchChain) return;
            
            const signer = (wallet as EVMWallet).getSigner();
            const ensControllerContract = new ethers.Contract(ens_controller_address, ensABI, signer );
            
            const resultCommit = await ensControllerContract.commit(formatBytes32String("dotlab"));
            const txCommitReceipt = await resultCommit.wait();
            if (txCommitReceipt.status !== 1) {
                alert('Commit error');
                return;
            }

            const addr = await signer.getAddress();
            const price = await ensControllerContract.rentPrice(domainName, 31536000);
            alert(`Rent price is ${price[0]}`)
            const resultRegister = await ensControllerContract.register(domainName, addr, 31536000, formatBytes32String("dotlab"), addr, [], true, 1, {
                value: price[0] ,
                gasLimit: 510000,
                nonce: undefined,
            } );

            const txRegisterReceipt = await resultRegister.wait();
            alert(txRegisterReceipt);

            return true;
        } catch (err) {
            alert(err)
        }
        
    }

    const handleCheckClick =()=>{
        processENSCheckValid(name).then((result)=>{
            if(result===true) {
                alert("Please register");
            }
        });
    }

    const handleRegisterClick = () => {
        processENSRegister(name).then((result)=>{
            if(result === true)
                alert("finished");
        })
    }

    return (
        <div className='w-full flex flex-col gap-2'>
            <div className='w-full flex flex-row gap-2 items-center justify-center px-8'>
                <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    className="min-w-[600px] h-[40px] py-1 px-2 border border-gray-300"
                    placeholder={'Input name to register'}
                    required={true}
                />
                <button
                    id="check"
                    name="check"
                    className='border px-2 h-[40px] hover:bg-gray-300'
                    onClick={handleCheckClick}
                >
                    Check
                </button>
                <button
                    id="register"
                    name="register"
                    disabled = {!availableName}
                    className='border px-2 h-[40px] hover:bg-gray-300 disabled:bg-gray-300 disabled:text-gray-100'
                    onClick={handleRegisterClick}
                >
                    Register
                </button>
            </div>
            <div className='pl-[100px]'>
                <span>{`Rent price is ${ethers.utils.formatEther(rentprice)}`}</span>
            </div>
        </div>
    )
}

export default ModuleENS;