import { useWallet } from '../wallet-packages/react';
import { BigNumber, ethers } from 'ethers';
import { useState } from 'react';
import ensABI from '../utils/contract-abi/ens/controller.json';
import { EVMWallet } from '../wallet-packages/wallets/evm';
import { formatBytes32String } from 'ethers/lib/utils.js';

// const ens_controller_address = "0x253553366Da8546fC250F225fe3d25d0C782303b";
// const ens_public_resolver = "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63";
// const providerUrl_eth = "https://eth-rpc.gateway.pokt.network";
// const chainid = 1;

// for testnet
const ens_controller_address = "0xCc5e7dB10E65EED1BBD105359e7268aa660f6734";
const ens_public_resolver = "0xCc5e7dB10E65EED1BBD105359e7268aa660f6734";
const providerUrl_eth = "https://goerli.blockpi.network/v1/rpc/public";
const chainid = 5;

async function getAddressENS(domainName:string) {
    try{
        const provider = new ethers.providers.JsonRpcProvider(providerUrl_eth);
        const address = await provider.resolveName(domainName);
        return address;
    } catch (err) {
        throw err;
    }
}

const ModuleENS = ({RentPeriod}: {RentPeriod: number})=>{
    const wallet = useWallet();
    const [name, setName] = useState('alice.eth');    
    const [rentprice, setRentPrice] = useState(0);
    const [availableName, setAvailableName] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleNameChange = (event: any) => {
        setName(event.target.value);
        setRentPrice(0);
        setAvailableName(false);
      };
    
    const processENSCheckValid = async(domainName: string) => {
        try {
            if(RentPeriod < 28) {
                alert("Rent period must be larger than 28 days.");
                return;
            }
            setLoading(true)
            if(!availableName) {
                const result = await getAddressENS(domainName);
                if(result) {
                    alert(`${name} already registered with this address ${result}`);
                    setRentPrice(0);
                    setAvailableName(false);
                    setLoading(false);
                    return false; 
                } else {
                }
            }
            const provider = new ethers.providers.JsonRpcProvider(providerUrl_eth);
            const resultSwitchChain = await (wallet as EVMWallet).switchChain(chainid).then(()=>{
                setLoading(false);
                return true;
            }).catch((err)=>{
                alert(`Something went error for switch to Ethereum mannet. Error: ${err}`);
                setLoading(false);
                return false;
            });

            if(!resultSwitchChain) {
                setLoading(false);
                return;
            }
            const signer = (wallet as EVMWallet).getSigner();
            const ensControllerContract = new ethers.Contract(ens_controller_address, ensABI, signer );
            
            const price = await ensControllerContract.rentPrice(domainName, RentPeriod*24*3600);
            // const gas = await ensControllerContract.estimateGas.register(domainName, addr, 31536000, formatBytes32String("dotlab"), addr, [], true, 1 );
            setRentPrice(price[0]);
            setAvailableName(true);
            setLoading(false);
            return true;
        } catch (err) {
            alert(err)
            setLoading(false);
        }
    }
    const processENSRegister = async(domainName: string) => {
        try {
            const provider = new ethers.providers.JsonRpcProvider(providerUrl_eth);
            const resultSwitchChain = await (wallet as EVMWallet).switchChain(chainid).then(()=>{
                return true;
            }).catch((err)=>{
                alert(`Something went error for switch to Ethereum mannet. Error: ${err}`);
                return false;
            });

            if(!resultSwitchChain) return;
            
            setLoading(true);
            const signer = (wallet as EVMWallet).getSigner();
            const ensControllerContract = new ethers.Contract(ens_controller_address, ensABI, signer );
            
            const addr = await signer.getAddress();
            const secret = formatBytes32String("dotlab"+domainName);

            const commit_data = await ensControllerContract.makeCommitment(
                domainName, addr, RentPeriod*24*3600, secret, ens_public_resolver, [], true, 1
            );

            const resultCommit = await ensControllerContract.commit(commit_data).then((data:any)=>{
                return {tx: data}
            }).catch((error: any)=>{
                return {tx: null, errcode: error.error?.code!};
            });
            if(resultCommit.tx!==null) {
                const txCommitReceipt = await resultCommit.tx.wait();
                if (txCommitReceipt.status !== 1) {
                    alert('Commit error');
                    setLoading(false);
                    return;
                }
            } else if (resultCommit.errcode!==-32603){
                setLoading(false);
                return;
            }
            
            const price = await ensControllerContract.rentPrice(domainName, RentPeriod*24*3600);
            const bufferedPrice = price[0].mul(110).div(100);

            await new Promise(()=>setTimeout(async()=>{
                const resultRegister = await ensControllerContract.register(domainName, addr, RentPeriod*24*3600, secret, ens_public_resolver, [], true, 1, {
                    value: bufferedPrice ,
                    gasLimit: 510000,
                    nonce: undefined,
                } );
    
                const txRegisterReceipt = await resultRegister.wait();
                alert(txRegisterReceipt);
            }, 60000));
            setLoading(false);
            return true;
        } catch (err) {
            setLoading(false);
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
        })
    }

    return (
        <div className='w-full flex flex-col gap-2 relative'>
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
                <span>{`Rent price is ${ethers.utils.formatEther(rentprice)} ETH`}</span>
            </div>

            <div className={`${loading? 'visible': 'invisible'} absolute z-50 top-0
              w-full h-full flex flex-col items-center justify-center bg-black/20`}>
              <div className="mx-10 flex h-[100px] w-[300px] flex-col items-center justify-center rounded-3xl bg-black/20 px-4">
                  <div className="loading-spinner "></div>
                  <span className="pt-[5px] text-[14px] text-white">
                      Processing...
                  </span>
              </div>
            </div>
        </div>
    )
}

export default ModuleENS;