import { useEffect, useState } from 'react';
import './App.css';
import { ethers } from 'ethers';
import faucetContract from './ethereum/faucet';

function App() {
  // State variables initialization
  // Step 1: `Provider` here given by metamask (i.e A connection to the Ethereum network)
  const [walletAddress, setWalletAddress] = useState('');

  // Step 2: `Signer(i.e Holds your private key and can sign things such as `messages` and `transactions`)
  const [signer, setSigner] = useState();

  // Step 3: `Contract`=> an abstraction which represents a connection to a specific contract on the Ethereum Network, so that applications can use it like a normal JavaScript object.
  const [fcContract, setFcContract] = useState();

  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');
  const [transactionData, setTransactionData] = useState(''); // `Transaction Hash`

  // useEffect hook to run code after render
  useEffect(() => {
    getCurrentWalletConnected(); // Fetch wallet information
    addWalletListener(); // Add listener for wallet changes
  }, [walletAddress]); // Dependency array

  const connectWallet = async () => {
    if (typeof window != 'undefined' && typeof window.ethereum != 'undefined') {
      try {
        /* Step1: get provider */
        const provider = new ethers.providers.Web3Provider(window.ethereum); // Initializing provider
        /* Step2: get accounts */
        const accounts = await provider.send('eth_requestAccounts', []);
        /* Step3: get signer */
        setSigner(provider.getSigner());
        /* local contract instance */
        setFcContract(faucetContract(provider)); // taken from `faucet.js`

        /* set active wallet address */
        setWalletAddress(accounts[0]);
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log('Please install MetaMask');
    }
  };

  // Function to fetch currently connected wallet whenever the page refreshed
  const getCurrentWalletConnected = async () => {
    if (typeof window != 'undefined' && typeof window.ethereum != 'undefined') {
      try {
        /* get provider */
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        /* get accounts */
        const accounts = await provider.send('eth_accounts', []);
        if (accounts.length > 0) { // means we are connected
          /* get signer */
          setSigner(provider.getSigner());
          /* local contract instance */
          setFcContract(faucetContract(provider)); // taken from `faucet.js`

          /* set active wallet address */
          setWalletAddress(accounts[0]);
        } else {
          console.log('Connect to MetaMask using the Connect Wallet button');
        }
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log('Please install MetaMask');
    }
  };

  // Function to add listener for wallet changes
  const addWalletListener = async () => {
    if (typeof window != 'undefined' && typeof window.ethereum != 'undefined') {
      window.ethereum.on('accountsChanged', (accounts) => {
        setWalletAddress(accounts[0]);
      });
    } else {
      /* MetaMask is not installed */
      setWalletAddress('');
      console.log('Please install MetaMask');
    }
  };

  // Function to handle `get token` request
  const getSKGHandler = async () => {
    setWithdrawError('');
    setWithdrawSuccess('');
    try {
      const fcContractWithSigner = fcContract.connect(signer);
      const resp = await fcContractWithSigner.requestTokens();
      setWithdrawSuccess('Operation succeeded - enjoy your tokens!');
      setTransactionData(resp.hash); // for getting just hash of the `Tx`
    } catch (err) {
      setWithdrawError(err.message);
    }
  };

  // JSX rendering
  return (
    <div>
      {/* Navigation bar */}
      <nav className="navbar">
        <div className="container">
          <div className="navbar-brand">
            <h1 className="navbar-item is-size-4">Skg Token (SKG)</h1>
          </div>
          <div id="navbarMenu" className="navbar-menu">
            <div className="navbar-end is-align-items-center">
              {/* Button to connect wallet */}
              <button
                className="button is-white connect-wallet"
                onClick={connectWallet}
              >
                <span className="is-link has-text-weight-bold">
                  {walletAddress && walletAddress.length > 0
                    ? `Connected: ${walletAddress.substring(
                        0,
                        6
                      )}...${walletAddress.substring(38)}`
                    : 'Connect Wallet'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Main section */}
      <section className="hero is-fullheight">
        <div className="faucet-hero-body">
          <div className="container has-text-centered main-content">
            <h1 className="title is-1">Faucet</h1>
            <p>Fast and reliable. 50 SKG/day.</p>
            <div className="mt-5">
              {/* Withdrawal error message */}
              {withdrawError && (
                <div className="withdraw-error">{withdrawError}</div>
              )}
              {/* Withdrawal success message */}
              {withdrawSuccess && (
                <div className="withdraw-success">{withdrawSuccess}</div>
              )}
            </div>
            {/* Wallet address input */}
            <div className="box address-box">
              <div className="columns">
                <div className="column is-four-fifths">
                  <input
                    className="input is-medium"
                    type="text"
                    placeholder="Enter your wallet address (0x...)"
                    defaultValue={walletAddress}
                  />
                </div>
                <div className="column">
                  {/* Button to request tokens */}
                  <button
                    className="button is-link is-medium"
                    onClick={getSKGHandler}
                    disabled={walletAddress ? false : true}
                  >
                    GET TOKENS
                  </button>
                </div>
              </div>
              {/* Transaction data display */}
              <article className="panel is-grey-darker">
                <p className="panel-heading">Transaction Data</p>
                <div className="panel-block">
                  <p>
                    {transactionData
                      ? `Transaction hash: ${transactionData}`
                      : '--'}
                  </p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App; // Exporting App component
