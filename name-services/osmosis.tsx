import { useWallet } from '../wallet-packages/react';
import { useState } from 'react';
import { EVMWallet } from '../wallet-packages/wallets/evm';
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';

const resolverAddress = "osmo1xk0s8xgktn9x5vwcgtjdxqzadg88fgn33p8u9cnpdxwemvxscvast52cdd";

async function getAddressICNS(domainName:string) {
    try{
        const client = await CosmWasmClient.connect("https://rpc.osmosis.zone");
        // const queryClient = new contracts.IcnsResolver.IcnsResolverQueryClient(client as any, resolverAddress);
        // const {bech32_address} = await queryClient.addressByIcns({icns: domainName});

        const {bech32_address}= await client.queryContractSmart(resolverAddress, 
                {
                    address_by_icns: {
                        "icns": domainName
                    }
                }
            );

        return bech32_address;
    } catch(err) {
        throw err;
    }
}

const ModuleICNS = ()=>{
    const wallet = useWallet();
    const [name, setName] = useState('dogemos.osmo');    
    const [rentprice, setRentPrice] = useState(0);
    const [availableName, setAvailableName] = useState(false);
    const handleNameChange = (event: any) => {
        setName(event.target.value);
        setRentPrice(0);
        setAvailableName(false);
      };
    
    const processICNSCheckValid = async(domainName: string) => {
        try {
            if(!availableName) {
                const result = await getAddressICNS(domainName);
                if(result) {
                    alert(`${name} already registered with this address ${result}`);
                    setRentPrice(0);
                    setAvailableName(false);
                    return false; 
                } else {
                }
            }
          
            setRentPrice(0);
            setAvailableName(true);
            return true;
        } catch (err) {
            alert(err)
        }
    }
    const processICNSRegister = async(domainName: string) => {
        try {
            
            return true;
        } catch (err) {
            alert(err)
        }
        
    }

    const handleCheckClick =()=>{
        processICNSCheckValid(name).then((result)=>{
            if(result===true) {
                alert("Please register");
            }
        });
    }

    const handleRegisterClick = () => {
        processICNSRegister(name).then((result)=>{
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
                <span>{`Rent price is ${rentprice}`}</span>
            </div>
        </div>
    )
}

export default ModuleICNS;