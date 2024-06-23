import React, { useEffect, useState } from 'react'
import { logo } from '../assets'
import '../App.css'
import { setUserBalance, setLoginState, setAlertMessage } from '../store/slice'
import { useDispatch, useSelector } from 'react-redux'
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers5/react'
import { ethers } from 'ethers'
import mepABI from '../utils/MEP.json'

const mepTokenAddress = import.meta.env.VITE_MEP_TOKEN_ADDRESS

const Navbar = () => {
  const dispatch = useDispatch()
  const { open, provider } = useWeb3Modal()
  const { address, isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const userBalance = useSelector((state) => state.userBalance)
  const [walletConnected, setWalletConnected] = useState(false)
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)

  useEffect(() => {
    setWalletConnected(!!provider)
  }, [provider])


  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsLoadingBalance(true)
        if (isConnected) {
          const ethersProvider = new ethers.providers.Web3Provider(walletProvider)
          const signer = ethersProvider.getSigner()
          const contract = new ethers.Contract(mepTokenAddress, mepABI, signer)
          const balance = await contract.balanceOf(address)
          const decimals = await contract.decimals()

          dispatch(setUserBalance(balance / Math.pow(10, decimals)))
          dispatch(setLoginState(true))
          setWalletConnected(true)
        } else {
          await open()
        }
        setIsLoadingBalance(false)
      } catch (error) {
        dispatch(setAlertMessage({ message: 'Error connecting to MetaMask or fetching balance', type: 'alert' }))
        setTimeout(() => dispatch(setAlertMessage({})), 1200)
        setIsLoadingBalance(false)
      }
    } else {
      dispatch(setAlertMessage({ message: 'MetaMask is not installed', type: 'alert' }))
      setTimeout(() => dispatch(setAlertMessage({})), 1200)
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

  useEffect(()=>{
    if(isConnected)
      connectWallet()
  },[isConnected])


  return (
    <nav className='fixed w-full z-50 bg-[#10141F]'>
      <div className="flex w-[98%] font-['Changa_One',Impact,sans-serif] xs:w-[90%] mx-auto justify-between py-2 px-4">
        <div className="w-[4rem] h-[4rem]">
          <img src={logo} alt="" className='w-full h-full object-fill' />
        </div>
        <ul className='z-50 lg:hidden flex gap-3 items-center justify-center'>
          {userBalance ? (
            <button onClick={async () => await open()} className='btn'>{userBalance} $MEP</button>
          ) : (
            <button className='btn' onClick={handleConnectWallet}>
              {isLoadingBalance ? 'fetching balance...' : 'connect wallet'}
            </button>
          )}
          <button onClick={activateNavbar} id="navbar-toggler" className="text-xl py-[0.9rem] text-white">☰</button>
        </ul>
        <ul className='navbar z-50 flex flex-col justify-center fixed h-screen w-64 top-0 right-0 bg-[#10141F] items-center gap-4 translate-x-[100%] lg:translate-x-0 lg:h-auto lg:w-auto lg:flex-row lg:static'>
          <p className='border-b-[3px] leading-4 border-b-[#0000EE] text-[#CAE0A2] hover:text-[#ffffff] font-bold cursor-pointer'>Home</p>
          <p className='border-b-[3px] leading-4 border-b-[#0000EE] text-[#CAE0A2] hover:text-[#ffffff] font-bold cursor-pointer'>Pillars</p>
          <p className='border-b-[3px] leading-4 border-b-[#0000EE] text-[#CAE0A2] hover:text-[#ffffff] font-bold cursor-pointer'>Story</p>
          <p className='border-b-[3px] leading-4 border-b-[#0000EE] text-[#CAE0A2] hover:text-[#ffffff] font-bold cursor-pointer'>Contract</p>
          {userBalance ? (
            <button onClick={async () => await open()} className='btn hidden md:block'>{userBalance} $MEP</button>
          ) : (
            <button className='btn' onClick={handleConnectWallet}>
              {isLoadingBalance ? 'fetching balance...' : 'connect wallet'}
            </button>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
