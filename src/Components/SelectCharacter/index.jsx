
import React, { useEffect, useState } from "react";
import "./SelectCharacter.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json";
import LoadingIndicator from "../LoadingIndicator";

const SelectCharacter = ({setCharacterNFT}) => {

  const [characterNFTs, setCharacterNFTs] = useState([]);
  const [gameContract, setGameContract] = useState();
  const [mintingCharacter, setMintingCharacter] = useState(false);

  const mintCharacterNFTAction = async (index) => {
    try  {
      if ( index >= 0 && index < characterNFTs.length && gameContract ) {
        setMintingCharacter(true);
        console.log("Minting ", characterNFTs[index].name);
        const mintTxn = await gameContract.mintCharacterNFT(index);
        await mintTxn.wait();
        console.log("Minted ", characterNFTs[index]);
        setMintingCharacter(false);
      }
    } catch ( err ) {
      console.warn("MintCharacterNFTAction Error: ", err);
      setMintingCharacter(false);
    }
  }

  const renderCharacters = () => (
    characterNFTs.map((character, index) => (
      <div className="character-item" key={character.name}>
        <div className="name-container">  
          <p>{character.name}</p>
        </div>
        <img src={character.imageUri} alt={character.name} />
        <button
          type="button"
          className="character-mint-button"
          onClick={() => mintCharacterNFTAction(index)}
        >{`Mint ${character.name}`}</button>
      </div>
    ))
  );

  useEffect(() => {
    const { ethereum } = window;
    if ( ethereum ) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicGame.abi, signer);
      setGameContract(gameContract);
    } else {
      consoel.log("Ethereum object not found");
    }
  }, []);

  useEffect(() => {
    const getCharacterNFTs = async () => {
      try {
        console.log('Getting contract characters to mint');
        const charactersTxn = await gameContract.getAllDefaultCharacters();
        console.log(charactersTxn);
        const characters = charactersTxn.map(characterData => transformCharacterData(characterData));
        console.log(characters);
        setCharacterNFTs(characters);
      } catch (err) {
        console.error("Something went wrong while getting character NFTs!!!");
      }
    }
    /*
    * Add a callback method that will fire when this event is received
    */
    const onCharacterMinted = async (sender, tokenId, characterIndex) => {
      console.log(
        `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
      );
      alert(`Your NFT is all done -- see it here: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)

      /*
      * Once our character NFT is minted we can fetch the metadata from our contract
      * and set it in state to move onto the Arena
      */
      if ( gameContract ) {
        const characterTxn = await gameContract.checkIfUserHasNFT();
        if ( characterTxn.name ) {
          setCharacterNFT(transformCharacterData(characterTxn));
        }
      }
    }

    if ( gameContract ) {
      getCharacterNFTs();

      /*
      * Setup NFT Minted Listener
      */
      gameContract.on("CharacterNFTMinted", onCharacterMinted);
    }

    return () => {
      /*
      * When your component unmounts, let;s make sure to clean up this listener
      */
      if ( gameContract ) {
        /*
        * When your component unmounts, let;s make sure to clean up this listener
        */
        gameContract.off("CharacterNFTMinted", onCharacterMinted);
      }
    }
  }, [gameContract]);

  return (
    <div className="select-character-container">
      <h2>Mint Your Hero. Choose wisely.</h2>
      {/* Only show this when there are characters in state */
        characterNFTs.length > 0 && (
          <div className="character-grid">
            {renderCharacters()}
          </div>
        )
      }
      {/* Only show our loading state if mintingCharacter is true */}
      {mintingCharacter && (
        <div className="loading">
          <div className="indicator">
            <LoadingIndicator />
            <p>Minting In Progress...</p>
          </div>
          <img
            src="https://media2.giphy.com/media/61tYloUgq1eOk/giphy.gif?cid=ecf05e47dg95zbpabxhmhaksvoy8h526f96k4em0ndvx078s&rid=giphy.gif&ct=g"
            alt="Minting loading indicator"
          />
        </div>
      )}
    </div>
  )
}

export default SelectCharacter;