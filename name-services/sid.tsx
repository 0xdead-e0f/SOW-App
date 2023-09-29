import { useWallet } from '../wallet-packages/react';
import { ethers, providers } from 'ethers';
import { useState } from 'react';
import sidABI from '../utils/contract-abi/sid/controller.json';
import { EVMWallet } from '../wallet-packages/wallets/evm';
import { formatBytes32String } from 'ethers/lib/utils.js';

import SIDRegister from '@web3-name-sdk/register'
import { validateName, getSidAddress, namehash } from '@siddomains/sidjs'

import {
    getResolverContract,
    getSIDContract,
    // @ts-ignore
  } from '@siddomains/sidjs/dist/utils/contract';
import { interfaces } from '@siddomains/sidjs/dist/constants/interfaces';
// const SID = require('@siddomains/sidjs').default;      
// const SIDfunctions = require('@siddomains/sidjs');
const rpc = require('@siddomains/sidjs/dist/constants/rpc');

// // const bnb_controller_address = "0x524bd5676d24d89C240276DB69A7De2960F519a7";

// const bnb_controller_address = "0xE170EAbb4226C505318676897ee1B312D867de80";

const providerUrl_bnb = "https://1rpc.io/bnb";
const providerUrl_bnb_test="https://bsc-testnet.publicnode.com";
// const chainid = 56;
let chainid = 97;  //for testnet

let registrarController:any = null;
let sidAddress : string = "";
const getLabel = (domainName: string) => {
    var nameArray = domainName.split('.');
    if(nameArray.length > 2)
        return {result: false, label: ""};
    if(validateName(domainName)!==domainName)
        return {result: false, label: ""};
    if(nameArray.length === 1) return {result: true, label: nameArray[0]};
    if(nameArray.length === 2) {
        return {result: nameArray[1]==="bnb", label: nameArray[0]};
    } 
    
    return {result: false, label: ""}
}

const getTldByChainId = (chainId: number) => {
    switch (chainId) {
      case 1:
        return 'eth'
      case 97:
      case 56:
        return 'bnb'
      case 42161:
      case 421613:
        return 'arb'
      default:
        return 'bnb'
    }
  }

async function getRegistrarController(chainId: number, provider: any) {
    if (!sidAddress) {
        sidAddress = getSidAddress(chainId);
    }
    if (!registrarController) {
        const sidContract = getSIDContract({
            address: sidAddress,
            provider: provider,
        })
        
        const hash = namehash(getTldByChainId(chainId))
        const resolverAddr = await sidContract.resolver(hash)
        const resolverContract = getResolverContract({
            address: resolverAddr,
            provider: provider,
        })
        const registrarControllerAddr = await resolverContract.interfaceImplementer(
            hash,
            interfaces.permanentRegistrar
        )
        
        registrarController = new ethers.Contract(registrarControllerAddr, sidABI, provider)
        
        return registrarController as ethers.Contract
    }
    
    if (!registrarController) throw new Error('Registrar Controller is not initialized')
    return registrarController
}

async function getAvailable(domainName: string, chainid: number): Promise<boolean> {
    const normalizedName = getLabel(domainName)
    if (!normalizedName.result) throw new Error('unnormailzed name')
    const provider = new ethers.providers.JsonRpcProvider(chainid===56?providerUrl_bnb:providerUrl_bnb_test);
    const registrarController = await getRegistrarController(chainid, provider)
    return registrarController.available(normalizedName)
}

const ModuleSID = ({RentPeriod}: {RentPeriod: number})=>{
    const wallet = useWallet();
    const [name, setName] = useState('nft.bnb');    
    const [rentprice, setRentPrice] = useState(0);
    const [loading, setLoading] = useState(false);
    const [availableName, setAvailableName] = useState(false);
    const handleNameChange = (event: any) => {
        setName(event.target.value);
        setRentPrice(0);
        setAvailableName(false);
      };
    
    const processSIDCheckValid = async(domainName: string) => {
        try {
            if(!availableName) {
                const result = await getAvailable(domainName, chainid);
                if(result) {
                    alert(`${name} already registered with this address ${result}`);
                    setRentPrice(0);
                    setAvailableName(false);
                    return false; 
                } else {
                }
            }
            
            const provider = new ethers.providers.JsonRpcProvider(chainid===56?providerUrl_bnb:providerUrl_bnb_test);
            const registrarControllerContract = await getRegistrarController(chainid, provider);
            
            // const addr = await signer.getAddress();
            const price = await registrarControllerContract.rentPrice(domainName, RentPeriod*24*3600);
            setRentPrice(price[0]);
            setAvailableName(true);

            return true;
        } catch (err) {
            console.log(err);
        }
    }

//     const processSIDRegister = async(domainName: string) => {
//         try {
//             const provider = new ethers.providers.JsonRpcProvider(providerUrl_bnb);
//             const resultSwitchChain = await (wallet as EVMWallet).switchChain(56).then(()=>{
//                 return true;
//             }).catch((err)=>{
//                 alert(`Something went error for switch to Ethereum mainnet. Error: ${err}`);
//                 return false;
//             });

//             if(!resultSwitchChain) return;
            
//             const signer = (wallet as EVMWallet).getSigner();
//             const ensControllerContract = new ethers.Contract(bnb_controller_address, sidABI, signer );
            
//             const resultCommit = await ensControllerContract.commit(formatBytes32String("dotlab"));
//             const txCommitReceipt = await resultCommit.wait();
//             if (txCommitReceipt.status !== 1) {
//                 alert('Commit error');
//                 return;
//             }

//             const addr = await signer.getAddress();

//             const resultRegister = await ensControllerContract.register(domainName, addr, 31536000, formatBytes32String("dotlab"), {
//                 value: rentprice ,
//                 gasLimit: 510000,
//                 nonce: undefined,
//             } );

//             const txRegisterReceipt = await resultRegister.wait();
//             alert(txRegisterReceipt);

//             return true;
//         } catch (err) {
//             alert(err)
//         }
        
//     }


    // const processSIDCheckValid = async(domainName: string) => {
    //     if(RentPeriod < 365) {
    //         alert("Rent period must be larger than 1 year.");
    //         return;
    //     }

    //     // const provider = new providers.Web3Provider(window.ethereum)
    //     // switch to bsc
    //     const resultSwitchChain = await (wallet as EVMWallet).switchChain(chainid).then(()=>{
    //         return true;
    //     }).catch((err)=>{
    //         alert(`Something went error for switch to Ethereum mannet. Error: ${err}`);
    //         return false;
    //     });

    //     if(!resultSwitchChain) return false;
        
    //     // get signer
    //     // const signer = provider.getSigner()
    //     const signer = (wallet as EVMWallet).getSigner();
    //     // get address
    //     const address = await signer.getAddress()
    //     // init SIDRegister
    //     const register = new SIDRegister({ signer, chainId: chainid })
    //     // check if available
    //     const available = await register.getAvailable(domainName)
    //     setAvailableName(available);
    //     if(available === false)
    //     {
    //         return available;
    //     }
    //     // get price
    //     const price = await register.getRentPrice(domainName, (1))
    //     setRentPrice(price);
    //     setAvailableName(true);
    //     return true;
    // }

    const processSIDRegister = async(domainName: string) => {
        // const provider = new providers.Web3Provider(window.ethereum)
        const provider = new ethers.providers.JsonRpcProvider(providerUrl_bnb);
        // switch to bsc
        const resultSwitchChain = await (wallet as EVMWallet).switchChain(chainid).then(()=>{
            return true;
        }).catch((err)=>{
            alert(`Something went error for switch to Ethereum mannet. Error: ${err}`);
            return false;
        });
        if(!resultSwitchChain) return false;

         // get signer
        // const signer = provider.getSigner()
        const signer = (wallet as EVMWallet).getSigner();
        // get address
        const address = await signer.getAddress()
        // init SIDRegister
        const register = new SIDRegister({ signer, chainId: chainid })

        await register.register(domainName, address, (RentPeriod / 365))
        
        return true;

    }

    
    const handleCheckClick =()=>{
        const domanName = getLabel(name);
        if(!domanName.result) {
            alert("Invalid domain name");
            return;
        }

        setLoading(true);
        processSIDCheckValid(domanName.label).then((result)=>{
            if(result===true) {
                alert("Please register");
            }
            setLoading(false);
        });
    }

    const handleRegisterClick = () => {
        const domanName = getLabel(name);
        if(!domanName.result) {
            alert("Invalid domain name");
            return;
        }
        setLoading(true);
        processSIDRegister(domanName.label).then((result)=>{
            if(result === true)
                alert("finished");
            
            setLoading(false);
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
                <span>{`Rent price is ${ethers.utils.formatEther(rentprice)} BNB`}</span>
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

export default ModuleSID;