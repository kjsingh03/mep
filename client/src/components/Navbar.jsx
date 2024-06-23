import React, { useEffect, useState } from 'react'
import { logo } from '../assets'
import '../App.css'
import { setUserBalance, setLoginState, setAlertMessage } from '../store/slice'
import Web3 from 'web3'
import { useDispatch, useSelector } from 'react-redux'
import mepABI from '../utils/MEP.json'
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers5/react'
import { ethers } from 'ethers'

const mepTokenAddress = import.meta.env.VITE_MEP_TOKEN_ADDRESS

const Navbar = () => {
  const dispatch = useDispatch()
  const { open, provider } = useWeb3Modal()
  const userBalance = useSelector((state) => state.userBalance)
  const [walletConnected, setWalletConnected] = useState(false)

  const { address, chainId, isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()

  useEffect(() => {
    if (provider) {
      setWalletConnected(true)
    } else {
      setWalletConnected(false)
    }
  }, [provider])

  // useEffect(async ()=>{
  //   await connectWallet()
  // },[])

  const getTokenBalance = async (provider, userAddress) => {
    try {
      const contract = new ethers.Contract(mepTokenAddress, mepABI, provider)
      const balance = await contract.balanceOf(userAddress)
      const decimals = await contract.decimals()
      return balance / Math.pow(10, decimals)
    } catch (error) {
      console.error('Error fetching token balance: ', error)
      throw error
    }
  }

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        if (isConnected) {
          const ethersProvider = new ethers.providers.Web3Provider(walletProvider)
          const signer = await ethersProvider.getSigner()
          const contract = new ethers.Contract(mepTokenAddress, mepABI, signer)
          const balance = await contract.balanceOf(address)
          const decimals = await contract.decimals()

          dispatch(setUserBalance(parseInt(balance) / 10 ** 9))
          dispatch(setLoginState(true))
          setWalletConnected(true)
        }
        else {
          await open()
        }
      } catch (error) {
        dispatch(setAlertMessage({ message: 'Error connecting to MetaMask or fetching balance', type: 'alert' }))
        setTimeout(() => dispatch(setAlertMessage({})), 1200);
      }
    } else {
      dispatch(setAlertMessage({ message: 'MetaMask is not installed', type: 'alert' }))
      setTimeout(() => dispatch(setAlertMessage({})), 1200);
    }
  }

  const activateNavbar = () => {
    const navbar = document.querySelector('.navbar')
    const screen = document.querySelector('.screen')

    navbar.classList.add('active')
    screen.style.display = 'flex'

    screen.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        screen.style.display = 'none'
        navbar.classList.remove('active')
      }
    })
  }

  const handleConnectWallet = async () => {
    await connectWallet()
  }

  const handleFetchBalance = async () => {
    if (walletConnected) {
      try {
        const balance = await getTokenBalance(provider, await provider.getSigner().getAddress())
        dispatch(setAlertMessage({ message: `MEP Token Balance: ${balance} MEP`, type: 'alert' }))
        setTimeout(() => dispatch(setAlertMessage({})), 1200);
      } catch (error) {
        dispatch(setAlertMessage({ message: 'Error fetching MEP token balance', type: 'alert' }))
        setTimeout(() => dispatch(setAlertMessage({})), 1200);
      }
    } else {
      dispatch(setAlertMessage({ message: 'Wallet is not connected', type: 'alert' }))
      setTimeout(() => dispatch(setAlertMessage({})), 1200);
    }
  }


  return (
    <nav className='fixed w-full z-50 bg-[#10141F]'>
      <div className="flex w-[98%] font-['Changa_One',Impact,sans-serif] xs:w-[90%] mx-auto justify-between py-2 px-4">
        <div className="w-[4rem] h-[4rem]">
          <img src={logo} alt="" className='w-full h-full object-fill' />
        </div>
        <ul className='z-50 lg:hidden flex gap-3 items-center justify-center'>
          {userBalance ?
            (<button onClick={async()=>await open()} className='btn'>{userBalance} $MEP</button>) :
            <button className='btn' onClick={handleConnectWallet}>connect wallet</button>
          }
          <button onClick={activateNavbar} id="navbar-toggler" className="text-xl py-[0.9rem] text-white">☰</button>
        </ul>
        <ul className='navbar z-50 flex flex-col justify-center fixed h-screen w-64 top-0 right-0 bg-[#10141F] items-center gap-4 translate-x-[100%] lg:translate-x-0 lg:h-auto lg:w-auto lg:flex-row lg:static'>
          <p className='border-b-[3px] leading-4 border-b-[#0000EE] text-[#CAE0A2] hover:text-[#ffffff] font-bold cursor-pointer'>Home</p>
          <p className='border-b-[3px] leading-4 border-b-[#0000EE] text-[#CAE0A2] hover:text-[#ffffff] font-bold cursor-pointer'>Pillars</p>
          <p className='border-b-[3px] leading-4 border-b-[#0000EE] text-[#CAE0A2] hover:text-[#ffffff] font-bold cursor-pointer'>Story</p>
          <p className='border-b-[3px] leading-4 border-b-[#0000EE] text-[#CAE0A2] hover:text-[#ffffff] font-bold cursor-pointer'>Contract</p>
          {
            userBalance ?
              (<button onClick={async()=>await open()} className='btn hidden lg:block'>{userBalance} $MEP</button>) :
              <button className='btn' onClick={handleConnectWallet}>connect wallet</button>
          }
          {/* <button className='btn lg:hidden block' >Switch Wallet</button> */}
          {/* <button className='btn' onClick={handleFetchBalance}>Handle Fetch</button> */}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
