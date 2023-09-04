import { useWallet } from '../wallet-packages/react';
import { ethers } from 'ethers';
import { useState } from 'react';
import zknsAbi from '../utils/contract-abi/zkns/controller.json';
import { EVMWallet } from '../wallet-packages/wallets/evm';
import { formatBytes32String } from 'ethers/lib/utils.js';
import { Provider } from "zksync-web3";
const zkns_controller_address = "0x935442AF47F3dc1c11F006D551E13769F12eab13";
const providerUrl_eth = "https://eth-rpc.gateway.pokt.network";

async function getAddressZKNS(domainName:string) {
    try{
        const provider = new Provider(providerUrl_eth);
        const contract = await new ethers.Contract(zkns_controller_address, zknsAbi, provider);
        const [, domain, topLevelDomain] = domainName.match(/^(.+)\.([^.]+)$/) || [];
        const address = await contract.resolveAddress(domain);
        return address;
    } catch (err) {
        throw err;
    }
}

const ModuleZKNS = ()=>{
    const wallet = useWallet();
    const [name, setName] = useState('ross.zk');    
    const [rentprice, setRentPrice] = useState(0);
    const [availableName, setAvailableName] = useState(false);
    const handleNameChange = (event: any) => {
        setName(event.target.value);
        setRentPrice(0);
        setAvailableName(false);
      };
    
    const processENSCheckValid = async(domainName: string) => {
        try {
            if(name.length < 2) {
                alert("Length of name is longer than 1");
                return;
            }
            if(!availableName) {
                const result = await getAddressZKNS(domainName);
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
            const controllerContract = new ethers.Contract(zkns_controller_address, zknsAbi, signer );
            
            let price=0;
            if(name.length === 2)
                price = await controllerContract.Cost2Character();
            else if(name.length === 3)
                price = await controllerContract.Cost3Character();
            else 
                price = await controllerContract.Cost4Character();

            // const gas = await ensControllerContract.estimateGas.register(domainName, addr, 31536000, formatBytes32String("dotlab"), addr, [], true, 1 );
            setRentPrice(price);
            setAvailableName(true);
            return true;
        } catch (err) {
            alert(err)
        }
    }
    const processENSRegister = async(domainName: string) => {
        try {
            // const provider = new ethers.providers.JsonRpcProvider(providerUrl_eth);
            // const resultSwitchChain = await (wallet as EVMWallet).switchChain(1).then(()=>{
            //     return true;
            // }).catch((err)=>{
            //     alert(`Something went error for switch to Ethereum mannet. Error: ${err}`);
            //     return false;
            // });

            // if(!resultSwitchChain) return;
            
            // const signer = (wallet as EVMWallet).getSigner();
            // const ensControllerContract = new ethers.Contract(ens_controller_address, ensABI, signer );
            
            // const resultCommit = await ensControllerContract.commit(formatBytes32String("dotlab"));
            // const txCommitReceipt = await resultCommit.wait();
            // if (txCommitReceipt.status !== 1) {
            //     alert('Commit error');
            //     return;
            // }

            // const addr = await signer.getAddress();
            // const price = await ensControllerContract.rentPrice(domainName, 31536000);
            // alert(`Rent price is ${price[0]}`)
            // const resultRegister = await ensControllerContract.register(domainName, addr, 31536000, formatBytes32String("dotlab"), addr, [], true, 1, {
            //     value: price[0] ,
            //     gasLimit: 510000,
            //     nonce: undefined,
            // } );

            // const txRegisterReceipt = await resultRegister.wait();
            // alert(txRegisterReceipt);

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

export default ModuleZKNS;