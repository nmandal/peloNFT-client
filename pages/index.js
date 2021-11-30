import { ethers } from "ethers";
import { Fragment, useEffect, useState } from "react";
import { Tab } from '@headlessui/react'

import Link from 'next/link'

import MintingModal from '../components/MintingModal'
import peloNft from '../utils/peloNFT.json';

const OPENSEA_LINK = 'https://testnets.opensea.io/collection/pelonft-v4';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x25C5E2AeEd0190d8A3A5D2b9615637229bbfC856";
const MAINNET_NETWORK_ID = "0x1" //TODO: deploy to mainnet
const RINKEBY_NETWORK_ID = "0x4"

const breadcrumbs = [
    { name: 'Collections', href: '#', current: false },
    { name: 'PeloNFT', href: '#', current: true },
  ]

const product = {
  name: 'PeloNFT by Nick Mandal',
  version: { name: '1.0', date: 'November 14, 2021', datetime: '2021-11-14' },
  description:
    'The PeloNFT collection lets you mint your own Peloton workout. Inspired by Loot, PeloNFT generates workout attibutes randomly and completely on-chain.',
  highlights: [
    'Randomly generated Peloton workout including length, class type, and instructor',
    'Only available on Rinkeby testnet',
  ],
  imageSrc: 'pelonft.jpg',
  imageAlt: 'PeloNFT #1 - a 45-min Yoga Flow with Aditi Shah.',
}
const faqs = [
  {
    question: 'What is an NFT?',
    answer:
      "An NFT is a non-fungible token. In other words, it's a unique digital asset that represents ownership of something. In PeloNFT's case, an NFT is a randomly generated, fictitious Peloton workout.",
  },
  {
    question: 'Why Peloton?',
    answer:
      "I'm a big fan of Peloton. I chose Peloton as the center of this collection because they are uniquely positioned as a company to make a big web3 play. Their power users love exclusivity, are generally tech-savvy, and are willing to spend a good amount of money on working out. Imagine if you minted a PeloNFT and then you got access to exclusive workout with the generated instructor? There are a lot of possibilities here...",
  },
  {
    question: 'When are you deploying this collection to the Ethereum Mainnet?',
    answer:
      "Soon. This is my first NFT collection and I want to make sure I'm crossing my t's and dotting my i's before I pay Ethereum gas fees.",
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Mint() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [nftsMinted, setNftsMinted] = useState(null);
  const [isMinting, setIsMinting] = useState(false)
  const [showMintedModal, setShowMintedModal] = useState(false)
  const [modalText, setModalText] = useState("")

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
  
    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    await checkChain(ethereum);

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        
        setupEventListener();
        getTotalNFTsMintedSoFar();
    } else {
        console.log("No authorized account found")
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Make sure you have metamask installed!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
      setupEventListener();
      getTotalNFTsMintedSoFar();
    } catch (error) {
      console.log(error)
    }
  }

  const setupEventListener = async () => {
    setIsMinting(true)    
    console.log('minting from event listener')
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, peloNft.abi, signer);

        connectedContract.on("NewPeloNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          setShowMintedModal(true)
          setModalText(`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });
  

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
    setIsMinting(false)
    console.log('minting from event listener')
  }

  async function getTotalNFTsMintedSoFar() {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          peloNft.abi,
          signer
        );

        let tokensMinted = await connectedContract.getTotalNFTsMintedSoFar() - 1;
        setNftsMinted(tokensMinted.toString());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const askContractToMintNft = async () => {
      setIsMinting(true)
      console.log('minting from mint')
      try {
        const { ethereum } = window;
  
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, peloNft.abi, signer);
  
          console.log("Going to pop wallet now to pay gas...")
          let nftTxn = await connectedContract.makeAPeloNFT();
  
          console.log("Mining...please wait.")
          await nftTxn.wait();
          console.log(nftTxn);
          console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
          getTotalNFTsMintedSoFar();
          setShowMintedModal(true)
          setModalText(`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${nftsMinted}`)
  
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error)
      }
      setIsMinting(false)
      console.log('not minting from mint')
  }

  async function checkChain(ethereum) {
    let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);

    if (chainId !== RINKEBY_NETWORK_ID) {
      alert("You are not connected to the Rinkeby Test Network!");
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  const renderNotConnectedContainer = () => (
    <button
      type="button"
      onClick={connectWallet}
      className="w-full bg-blue-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500"
      >
      Connect Wallet
    </button>
  );

  const renderMintUI = () => (
    <>
    {!isMinting ?
    <button
      type="button"
      className="w-full bg-blue-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500"
      onClick={askContractToMintNft}
    >
      Mint
    </button>
    : <button
    type="button"
    className="w-full bg-blue-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500"
    disabled
  >
    Minting...
  </button>
    }
    </>
  )


  return (
<>


    <div className="bg-white">

      {showMintedModal ? <MintingModal link={modalText} showModal={showMintedModal} /> : <></>}
      <div className="mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
      
        {/* Product */}
        <div className="lg:grid lg:grid-rows-1 lg:grid-cols-7 lg:gap-x-8 lg:gap-y-10 xl:gap-x-16">
          {/* Product image */}
          <div className="lg:row-end-1 lg:col-span-4">
            <div className="  rounded-lg bg-gray-100 overflow-hidden">
              <img src={product.imageSrc} alt={product.imageAlt} className="object-center object-cover" />
            </div>
          </div>

          {/* Product details */}
          <div className="max-w-2xl mx-auto mt-14 sm:mt-16 lg:max-w-none lg:mt-0 lg:row-end-2 lg:row-span-2 lg:col-span-3">
            <div className="flex flex-col-reverse">
              <div className="mt-4">
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">{product.name}</h1>

                <h2 id="information-heading" className="sr-only">
                  Product information
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  Version {product.version.name} (Created{' '}
                  <time dateTime={product.version.datetime}>{product.version.date}</time>)
                </p>
              </div>
            </div>

            <p className="text-gray-500 mt-6">{product.description}</p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
            <Link href={OPENSEA_LINK}>
            <a className="mr-2" target="_blank" rel="noreferrer" >
              <button
                type="button"
                className="w-full bg-blue-50 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500"
              >
                View Collection
              </button>
              </a>
              </Link>
            </div>

            <div className="border-t border-gray-200 mt-10 pt-10">
              <h3 className="text-sm font-medium text-gray-900">Highlights</h3>
              <div className="mt-4 prose prose-sm text-gray-500">
                <ul role="list">
                  {nftsMinted && (<li>Limited quantity ({nftsMinted} / {TOTAL_MINT_COUNT} minted so far)</li>)}
                  {product.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-10 pt-10">
              <h3 className="text-sm font-medium text-gray-900">Share</h3>
              <ul role="list" className="flex items-center space-x-6 mt-4">
                <li>
                <Link href="https://www.instagram.com/nick_mandal/">
                  <a target="_blank" rel="noreferrer" className="flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-500">
                    <span className="sr-only">Share on Instagram</span>
                    <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  </Link>
                </li>
                <li>
                <Link href="https://twitter.com/nick_mandal">
                  <a target="_blank" rel="noreferrer" className="flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-500">
                    <span className="sr-only">Share on Twitter</span>
                    <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="w-full max-w-2xl mx-auto mt-16 lg:max-w-none lg:mt-0 lg:col-span-4">
            <Tab.Group as="div">
              <div className="border-b border-gray-200">
                <Tab.List className="-mb-px flex space-x-8">

                  <Tab
                    className={({ selected }) =>
                      classNames(
                        selected
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-700 hover:text-gray-800 hover:border-gray-300',
                        'whitespace-nowrap py-6 border-b-2 font-medium text-sm'
                      )
                    }
                  >
                    FAQ
                  </Tab>
                </Tab.List>
              </div>
              <Tab.Panels as={Fragment}>
                <Tab.Panel as="dl" className="text-sm text-gray-500">
                  <h3 className="sr-only">Frequently Asked Questions</h3>
                  {faqs.map((faq) => (
                    <Fragment key={faq.question}>
                      <dt className="mt-10 font-medium text-gray-900">{faq.question}</dt>
                      <dd className="mt-2 prose prose-sm max-w-none text-gray-500">
                        <p>{faq.answer}</p>
                      </dd>
                    </Fragment>
                  ))}
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
