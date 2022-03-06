import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";

import SelectCharacter from "./Components/SelectCharacter";
import Arena from "./Components/Arena";
import LoadingIndicator from "./Components/LoadingIndicator"

import { CONTRACT_ADDRESS, NETWORK_VERSION, transformCharacterData } from "./constants";
import myEpicGame from "./utils/MyEpicGame.json";

import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

// Constants
const TWITTER_HANDLE = 'crazy010323';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  /*
   * Just a state variable we use to store our user's public wallet. Don't forget to import useState.
   */
  const [currentAccount, setCurrentAccount] = useState();
  const [characterNFT, setCharacterNFT] = useState();
  const [isLoading, setIsLoading] = useState(false);

  /*
   * Since this method will take some time, make sure to declare it as async
   */
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if ( !ethereum ) {
        console.log("Make sure you have Metamask installed on your browser!!!");
        setIsLoading(false);
        return;
      }
      console.log("We have the ethereum object: ", ethereum);

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if ( accounts.length === 0 ) {
        console.log("No authorized accounts found")
      } else {
        const account = accounts[0];
        console.log("Found an authorized account: ", account);
        setCurrentAccount(account);
      }
    } catch (err) {
      console.error(err);
    }

    setIsLoading(false);
  }

  /*
  * Implement your connectWallet method here
  */
  const connectWalletAction = async () => {
    try {
      const {ethereum} = window;
      if (!ethereum) {
;        alert('Get the Meteamask');
        return;
      } else {
        const accounts = await ethereum.request({method: 'eth_requestAccounts'});
        /*
        * Boom! This should print out public address once we authorize Metamask.
        */
        console.log('Connected: ', accounts[0]);
        setCurrentAccount(accounts[0]);
      }
    } catch(err) {
      console.error(err);
    }
  };

  const checkNetwork = async () => {
    try {
      if ( window.ethereum.networkVersion !== NETWORK_VERSION )
        alert("Please change your network to RinkeBy")
    } catch (err) {
      console.error(err);
    }
  }

  // 1. If user has has not connected to your app - Show Connect To Wallet Button
  // 2. If user has connected to your app AND does not have a character NFT - Show SelectCharacter Component
  // 3. If there is a connected wallet and characterNFT, it's time to battle!
  const renderContent = () => {
    if ( isLoading ) return (<LoadingIndicator></LoadingIndicator>);
    /*
    * Scenario #1
    */
    if ( !currentAccount ) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv"
            alt="Monty Python Gif"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
          Connect Wallet To Get Started
          </button>
        </div>
      )
    } else if ( !characterNFT ) {
      /*
      * Scenario #2
      */
      return (<SelectCharacter setCharacterNFT={setCharacterNFT}></SelectCharacter>)
    } else {
      /*
      * Scenario #3
      */
      return (<Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT}></Arena>);
    }
  }

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    /*
    * The function we will call that interacts with out smart contract
    */
    const fetchNFTMetadata = async () => {
      console.log("Checking for character NFT on address: ", currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicGame.abi, signer);

      const tx = await gameContract.checkIfUserHasNFT();
      console.log(tx);
      if ( tx.name ) {
        console.log("User has Character NFT");
        setCharacterNFT(tx);
      } else {
        console.log("User does not have the characte NFT");
      }
    }

    /*
    * We only want to run this, if we have a connected wallet
    */
    if ( currentAccount ) {
      console.log("Current Account: ", currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Metaverse Slayer ⚔️</p>
          <p className="sub-text">Team up to protect the Metaverse!</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
