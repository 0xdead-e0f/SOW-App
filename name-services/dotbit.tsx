import { useWallet } from '../wallet-packages/react';
import { ethers , Wallet as EthersWallet} from 'ethers';
import { useState } from 'react';
import sidABI from '../utils/contract-abi/sid/controller.json';
import { EVMWallet } from '../wallet-packages/wallets/evm';
import { formatBytes32String } from 'ethers/lib/utils.js';
import { BitSigner, createInstance } from 'dotbit';
import { BitPluginRegister } from '@dotbit/plugin-register';
import { CoinType, PaymentMethodIDs } from 'dotbit/lib/const';
import { EthersSigner } from 'dotbit/lib/signers/EthersSigner';


// async function getAddressSID(domainName:string) {
//     try{
//         const provider = new ethers.providers.JsonRpcProvider(rpc.apis.bsc_mainnet)
//         const sid = new SID({ provider, sidAddress: SIDfunctions.getSidAddress('56') })
//         const address = await sid.name(domainName).getAddress();
//         if(address === '0x0000000000000000000000000000000000000000') return undefined;
//         return address;
//     }catch( err) {
//         throw err;
//     }
// }

const ModuleDAS = ()=>{
    const wallet = useWallet();
    const [name, setName] = useState('nft.bnb');    
    const [rentprice, setRentPrice] = useState(0);

    const [availableName, setAvailableName] = useState(true);
    
    
    const handleNameChange = (event: any) => {
        setName(event.target.value);
        setRentPrice(0);
        setAvailableName(true);
      };
    
    const processSIDCheckValid = async(domainName: string) => {
        // try {
        //     if(!availableName) {
        //         const result = await getAddressSID(domainName);
        //         if(result) {
        //             alert(`${name} already registered with this address ${result}`);
        //             setRentPrice(0);
        //             setAvailableName(false);
        //             return false; 
        //         } else {
        //         }
        //     }
        //     const provider = new ethers.providers.JsonRpcProvider(providerUrl_bnb);
        //     (wallet as EVMWallet).switchChain(56);
        //     const resultSwitchChain = await (wallet as EVMWallet).switchChain(56).then(()=>{
        //         return true;
        //     }).catch((err)=>{
        //         alert(`Something went error for switch to Ethereum mannet. Error: ${err}`);
        //         return false;
        //     });
        //     if(!resultSwitchChain) return;
            
        //     const signer = (wallet as EVMWallet).getSigner();
        //     const ensControllerContract = new ethers.Contract(bnb_controller_address, sidABI, signer );
            
        //     // const addr = await signer.getAddress();
        //     const price = await ensControllerContract.rentPrice(domainName, 31536000);
        //     setRentPrice(price[0]);
        //     setAvailableName(true);

        //     // const gas = await ensControllerContract.estimateGas.register(domainName, addr, 31536000, formatBytes32String("dotlab") ,
        //     //     {
        //     //         gasLimit: 510000,
        //     //         gasPrice: ethers.utils.parseUnits('10', 'gwei'),
        //     //     }
        //     // );


        //     return true;
        // } catch (err) {
        //     console.log(err);
        // }
        return true;
    }
    const processSIDRegister = async(domainName: string) => {
        try {
            const _signer = (wallet as EVMWallet).getSigner();
            console.log((wallet as EVMWallet).getChainId());
            const signer = new EthersSigner(wallet as any);
            const dotbit = createInstance({signer: signer});
            const plgRegister = new BitPluginRegister();
            dotbit.installPlugin(plgRegister);
            const account = dotbit.account('example.bit');
            const addr = await (wallet as EVMWallet).getAddress();
            await account.register({
                keyInfo: {
                    key: addr?.toString() as any,
                    coin_type: CoinType.ETH,
                },
                registerYears: 1,
                paymentMethodID: PaymentMethodIDs.eth
            })
            const info = await account.info()
            console.log(info)
            return true;
        } catch (err) {
            alert(err)
        }
        
    }

    const handleCheckClick =()=>{
        processSIDCheckValid(name).then((result)=>{
            if(result===true) {
                alert("Please register");
            }
        });
    }

    const handleRegisterClick = () => {
        processSIDRegister(name).then((result)=>{
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

export default ModuleDAS;