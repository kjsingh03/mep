import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import './App.css';
import { Footer, Navbar } from './components';
import { createWeb3Modal, defaultConfig, useWeb3ModalProvider } from '@web3modal/ethers5/react'
import { useDispatch, useSelector } from 'react-redux';
import { setAlertMessage, setUserBalance } from './store/slice';
import Alert from './components/Alert';
import io from 'socket.io-client'
import { ethers } from 'ethers';
import contractAbi from './utils/Pool.json'
import tokenABI from './utils/MEP.json'
import axios from 'axios'

// 1. Get projectId
const projectId = '29fa5b8dbe55e7aaa7a0ef6baa46156b'

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com'
}
const sepolia = {
  chainId: 11155111,
  name: 'Sepolia',
  currency: 'ETH',
  explorerUrl: 'https://sepolia.etherscan.io',
  rpcUrl: 'https://rpc.sepolia.org',
};

// 3. Create a metadata object
const metadata = {
  name: 'My Website',
  description: 'My Website description',
  url: 'https://mywebsite.com', // origin must match your domain & subdomain
  icons: ['https://avatars.mywebsite.com/']
}

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: '...', // used for the Coinbase SDK
  defaultChainId: 1 // used for the Coinbase SDK
})

// 5. Create a Web3Modal instance
createWeb3Modal({
  ethersConfig,
  chains: [mainnet, sepolia],
  projectId,
  enableAnalytics: true // Optional - defaults to your Cloud configuration
})

const poolContractAddress = import.meta.env.VITE_POOL_CONTRACT_ADDRESS;

const mepTokenAddress = import.meta.env.VITE_MEP_TOKEN_ADDRESS;

const poolAbi = contractAbi;

const mepABI = tokenABI;


const App = () => {

  const dispatch = useDispatch();

  const userBalance = useSelector((state) => state.userBalance)
  const alertMessage = useSelector((state) => state.alertMessage)

  const [isFlipping, setIsFlipping] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [result, setResult] = useState(null);
  const [winCount, setWinCount] = useState(0);
  const [message, setMessage] = useState("");
  const [betAmount, setBetAmount] = useState(0);
  const [choice, setChoice] = useState('');
  const [username, setUsername] = useState(sessionStorage.getItem('name') || '');
  const [showNameModal, setShowNameModal] = useState(false);
  const socketRef = useRef(null);

  const [betHistory, setBetHistory] = useState([
    { player: 'Player X', amount: 1000, result: 'Win', time: new Date().getTime() - 2000, winCount: 7 },
    { player: 'Player X', amount: 1000, result: 'Lost', time: new Date().getTime() - 4000, winCount: 0 },
    { player: 'Player Y', amount: 100000, result: 'Lost', time: new Date().getTime() - 7000, winCount: 0 },
    { player: 'Player Z', amount: 10000, result: 'Lost', time: new Date().getTime() - 8000, winCount: 0 },
    { player: 'Player Y', amount: 1000, result: 'Win', time: new Date().getTime() - 10000, winCount: 2 },
    { player: 'Player X', amount: 1000, result: 'Win', time: new Date().getTime() - 13000, winCount: 0 },
    { player: 'Player Z', amount: 1000, result: 'Win', time: new Date().getTime() - 9000, winCount: 0 },
    { player: 'Player Y', amount: 10000, result: 'Win', time: new Date().getTime() - 14000, winCount: 4 },
    { player: 'Player Z', amount: 1000, result: 'Win', time: new Date().getTime() - 16000, winCount: 0 },
    { player: 'Player X', amount: 100000, result: 'Win', time: new Date().getTime() - 20000, winCount: 2 },
  ]);

  const videoRef = useRef(null);
  const loopCounterRef = useRef(0);

  useEffect(() => {
    if (!socketRef.current)
      socketRef.current = io(import.meta.env.VITE_SERVER_URL);

    const socket = socketRef.current;

    const handleUpdateHistory = (newRecord) => {
      setBetHistory((prevHistory) => [newRecord, ...prevHistory.slice(0, 9)]);
    }

    socket.on("updateHistory", handleUpdateHistory)

    return () => {
      socket.off("updateHistory", handleUpdateHistory)
    }

  }, [])


  const updateChoice = (e) => {
    document.querySelector('.bet.active')?.classList.remove('active');
    setChoice(e.target.innerText.toLowerCase());
    e.target.classList.add('active');
  };

  const updateBetAmount = (e) => {
    document.querySelector('.bet-amount.active')?.classList.remove('active');
    setBetAmount(parseInt(e.target.innerText.split(' ')[0]));
    e.target.classList.add('active');
  };

  const { walletProvider } = useWeb3ModalProvider()

  const placeBet = async () => {
    if (!userBalance) {
      dispatch(setAlertMessage({ message: 'Kindly Connect wallet first', type: 'alert' }))
      setTimeout(() => dispatch(setAlertMessage({})), 1200);
    }
    else if (!betAmount || !choice) {
      dispatch(setAlertMessage({ message: 'Kindly Choose bet and bet amount', type: 'alert' }))
      setTimeout(() => dispatch(setAlertMessage({})), 1200);
    }
    else if (!username) {
      setShowNameModal(true)
    }
    else if (userBalance < betAmount) {
      dispatch(setAlertMessage({ message: 'Insufficient Balance', type: 'alert' }))
      setTimeout(() => dispatch(setAlertMessage({})), 1200);
    }
    else if (!isFlipping && userBalance > betAmount && !isDepositing) {
      setIsDepositing(true)
      try {
        const provider = new ethers.providers.Web3Provider(walletProvider);
        const signer = provider.getSigner();

        const walletAddress = await signer.getAddress();

        const poolContract = new ethers.Contract(poolContractAddress, poolAbi, signer);
        const mepToken = new ethers.Contract(mepTokenAddress, mepABI, signer);

        const amountInWei = ethers.utils.parseEther(betAmount.toString()) / (10 ** 9);

        const approveTx = await mepToken.approve(poolContractAddress, amountInWei);
        await approveTx.wait();

        const depositTx = await poolContract.deposit(amountInWei);
        await depositTx.wait();

        setIsFlipping(true);

        dispatch(setUserBalance(userBalance - betAmount))

        setTimeout(() => {
          const newResult = Math.random() >= 0.5 ? 'heads' : 'tails';
          setResult(newResult);

          let betOutcomeMessage;
          if (choice === newResult) {
            betOutcomeMessage = `You won ${betAmount} $MEP! It was ${newResult}.`;
            setWinCount(winCount + 1);
            dispatch(setUserBalance(userBalance + betAmount))
          } else {
            betOutcomeMessage = `You lost ${betAmount} $MEP. It was ${newResult}.`;
            setWinCount(0);
          }

          setMessage(betOutcomeMessage);

          axios.post(`${import.meta.env.VITE_SERVER_URL}/distribute`, {
            walletAddress,
            betAmount,
            choice
          })
            .then(res => {
              console.log(res)
              socketRef.current.emit("emitBet", {
                player: username,
                amount: betAmount,
                result: choice === newResult ? 'Win' : 'Lost',
                time: new Date().getTime(),
                winCount: choice === newResult ? winCount + 1 : 0,
              })
            })
            .catch(err => console.log(err))


          setIsFlipping(false);
          setIsDepositing(false)

        }, 6000);

      } catch (error) {
        setIsDepositing(false)
        dispatch(setAlertMessage({ message: 'Transaction Failed', type: 'alert' }))
        setTimeout(() => dispatch(setAlertMessage({})), 1200);
      }

    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (username) {
      sessionStorage.setItem('name', username);
      setShowNameModal(false)
      placeBet()
    }
  };

  const getTimeDifference = (timestamp) => {
    const currentTime = new Date().getTime();
    const recordTime = new Date(timestamp).getTime();
    const difference = currentTime - recordTime;

    const seconds = Math.floor(difference / 1000);
    if (seconds < 60) {
      return `${seconds} seconds ago`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} minutes ago`;
    }

    const hours = Math.floor(minutes / 60);
    return `${hours} hours ago`;
  };

  useEffect(() => {
    if (isFlipping && videoRef.current) {
      videoRef.current.playbackRate = 1.0;
      videoRef.current.play();
      loopCounterRef.current = 1;
      videoRef.current.onended = () => {
        if (loopCounterRef.current < 3) {
          loopCounterRef.current += 1;
          videoRef.current.play();
        }
        else {
          setIsFlipping(false);
        }
      }
    }
  }, [isFlipping]);

  return (
    <>
      <Navbar />
      {
        alertMessage?.message &&
        <Alert message={alertMessage.message} type={alertMessage.type} />
      }
      <div className="min-h-screen flex flex-col justify-between gap-10">
        <div className="w-full min-h-[90vh] flex flex-col items-center justify-around gap-8 bg-[#000000] pt-28 pb-0">
          <div className="screen h-screen w-screen fixed left-0 top-0 bg-[#00000057] hidden flex-col items-center justify-center px-2 z-40">
          </div>

          <div className="flex flex-col gap-3 items-center w-full">
            <div className="flex flex-col gap-2 items-center w-[80vw] xs:w-[26rem] text-center">
              {
                isFlipping ? (
                  <video ref={videoRef} className='w-32 h-32'>
                    <source src="coin1.gif.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="h-32 flex justify-center items-center">
                    <div className={`coin ${isFlipping ? 'flipping' : ''}`}>
                      <div className={`side heads-img ${result === 'heads' ? 'show' : ''}`}></div>
                      <div className={`side tails-img ${result === 'tails' ? 'show' : ''}`}></div>
                    </div>
                  </div>
                )
              }
              <h6 className="text-xl text-white">I LIKE</h6>
              <div className="flex gap-4 w-full justify-center">
                <button className="btn bet w-full text-2xl" onClick={updateChoice}>Heads</button>
                <button className="btn bet w-full text-2xl" onClick={updateChoice}>Tails</button>
              </div>
              <h6 className="text-xl text-white">FOR</h6>
              <div className="flex flex-col xs:flex-row gap-4 w-full justify-center">
                <button className="btn bet-amount" onClick={updateBetAmount}>1000 $MEP</button>
                <button className="btn bet-amount" onClick={updateBetAmount}>10000 $MEP</button>
                <button className="btn bet-amount" onClick={updateBetAmount}>100000 $MEP</button>
              </div>
              <div className="border-t border-slate-300 pt-4 my-2 w-full flex justify-center">
                <button className="btn" onClick={placeBet} disabled={isFlipping}>Double or nothing</button>
              </div>
              <div className="h-2">
                {message && <h6 className="text-xl text-white">{message}</h6>}
              </div>
            </div>
          </div>

          <div className={`name-screen bg-[#00000067] ${showNameModal ? 'flex' : 'hidden'} justify-center items-center z-[49] w-screen h-screen fixed top-0 left-0`}>
            <div className="name-modal relative border border-slate-400/25 w-[95%] sm:w-[30rem] h-40 rounded-lg flex items-center justify-center">
              <form onSubmit={handleNameSubmit} className='w-full px-4 flex flex-col xs:flex-row gap-4 items-center justify-center'>
                <p onClick={() => setShowNameModal(false)} className="w-full text-right xs:absolute cursor-pointer top-3 right-4 text-[#CAE0A2] text-3xl font-bold">&times;</p>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your name" className="border p-2 bg-transparent text-white rounded-lg px-2 py-1" required />
                <button type="submit" className='btn btn1'>Join Room</button>
              </form>
            </div>
          </div>

          <div className="w-full max-w-2xl text-center text-white mx-auto h-[30rem]">
            <h2 className="text-2xl mb-4">Bet History</h2>
            <div className="bet-history flex flex-col gap-0 md:items-center whitespace-nowrap overflow-x-auto w-full scroll">
              {betHistory.map((record, index) => (
                <div className="border-t w-[35rem] sm:w-full border-slate-400 px-4 py-2 flex items-center justify-between" key={index}>
                  <p>{record.player} plays bet for {record.amount} $MEP and {record.result === 'Win' ? 'doubled' : 'got rugged'} {record.winCount > 1 && record.result === 'Win' ? `${record.winCount} times` : ''}</p>
                  <p>{getTimeDifference(record.time)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default App;
