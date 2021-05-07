import { Tabs, Tab } from "react-bootstrap";
import Dbank from "../abis/dBank.json";
import React, { Component } from "react";
import Token from "../abis/Token.json";
import dbank from "../dbank.png";
import Web3 from "web3";
import "./App.css";

//h0m3w0rk - add new tab to check accrued interest

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: "undefined",
      account: "",
      connectedText: "Not Connected",
      token: null,
      dBank: null,
      balance: 0,
      dBankAddress: null,
      walletText: "Connect to Wallet",
      walletDisabled: false,
    };
  }

  /**
   * Lifecycle Method - this is is called before everything else. Let's us make API calls or antyhing else needed before anything else happens.
   */
  async componentWillMount() {
    await this.loadBlockchainData();
  }

  async loadBlockchainData() {
    // Check if the user is already connected.
    console.log("load called.");

    // Check if ethereum object is set on window. Retrieved from MetaMask browser extension.
    if (typeof window.ethereum !== "undefined") {
      const web3 = new Web3(window.web3.currentProvider);
      const netId = await web3.eth.net.getId();
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("loadBlockchainData");
      console.log(accounts);

      // Check if logged in with MetaMask
      if (typeof accounts[0] === "undefined") {
        window.alert("Please log in with MetaMask");
      } else {
        const balance = await web3.eth.getBalance(accounts[0]);
        console.log(balance);
        this.setState({
          account: accounts[0],
          balance: balance,
          web3: web3,
          connectedText: "Connected",
          walletText: "Wallet Connected",
          walletDisabled: true,
        });
      }

      try {
        const token = new web3.eth.Contract(
          Token.abi,
          Token.networks[netId].address
        );
        const dBank = new web3.eth.Contract(
          Dbank.abi,
          Dbank.networks[netId].address
        );

        this.setState({
          token: token,
          dBank: dBank,
          dBankAddress: Dbank.networks[netId].address,
        });
      } catch (e) {
        window.alert("Error", e);
        console.log(e);
        window.alert("Contracts not deployed to the current network");
      }
    } else {
      window.alert("Please install MetaMask");
    }
  }

  async deposit(amount) {
    console.log(amount);

    if (this.state.dBank !== "undefined") {
      try {
        await this.state.dBank.methods
          .deposit()
          .send({ value: amount.toString(), from: this.state.account });
      } catch (e) {
        console.log("Error with deposit: " + e);
      }
    }

    //check if this.state.dbank is ok
    //in try block call dBank deposit();
  }

  async withdraw(e) {
    e.preventDefault();
    if (this.state.dBank !== "undefined") {
      try {
        await this.state.dBank.methods
          .withdraw()
          .send({from: this.state.account});
      } catch (e) {
        console.log("Error with withdraw: " + e);
      }
    }
  }

  /**
   * Connect our wallet.
   */
  async connectWallet() {
    if (typeof window.ethereum !== "undefined") {
      await window.ethereum.request({ method: "eth_requestAccounts" });
    }

    await this.loadBlockchainData();
  }

  render() {
    return (
      <div className="text-monospace">
        <section className="py-2 bg-light">
          <div className="container">
            <div className="row align-items-center">
              <div className="col">
                <a
                  className="navbar-brand"
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={dbank}
                    className="App-logo"
                    alt="logo"
                    height="32"
                  />
                  <b>dBank</b>
                </a>
              </div>
              <div className="col text-center">
                <span className="connected-text">
                  {this.state.connectedText}
                </span>{" "}
                <span className="text-muted">{this.state.account}</span>
              </div>
              <div className="col text-right">
                {this.state.walletDisabled === true && (
                  <button
                    className="btn btn-success"
                    disabled
                    onClick={async () => {
                      this.connectWallet();
                    }}
                  >
                    {this.state.walletText}
                  </button>
                )}
                {this.state.walletDisabled === false && (
                  <button
                    className="btn btn-primary"
                    onClick={async () => {
                      this.connectWallet();
                    }}
                  >
                    {this.state.walletText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="container-fluid mt-5 text-center">
          <br />
          <h1>This is a Decentralized Bank</h1>
          <h2>SpaceyNinja's Bank of Awesomeness</h2>
          <p className="mb-0">Your address: {this.state.account}</p>
          <p>Your balance: {this.state.balance}</p>
          <br />
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                  <Tab eventKey="deposit" title="Deposit">
                    <div>
                      <p className="mt-4">How much do you want to deposit?</p>
                      <p className="mb-0">The minimum amount is 0.01 ETH</p>
                      <p>1 deposit is possible at a time</p>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          let amount = this.depositAmount.value;
                          amount = amount * 10 ** 18; // Convert to wei.
                          this.deposit(amount);
                        }}
                      >
                        <div className="form-group">
                          <input
                            type="number"
                            id="depositAmount"
                            step="0.01"
                            min="0.01"
                            p
                            laceholder="amount..."
                            className="form-control"
                            required
                            ref={(input) => {
                              this.depositAmount = input;
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <button type="submit" className="btn btn-primary">
                            DEPOSIT
                          </button>
                        </div>
                      </form>
                    </div>
                  </Tab>
                  <Tab eventKey="withdaw" title="Withdaw">
                    <div>
                      <p className="mt-4">
                        Do you want to withdaw + take interest?
                      </p>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        onClick={(e) => 
                          this.withdraw(e)
                        }
                      >
                        WITHDRAW
                      </button>
                    </div>
                  </Tab>
                  {/*add Tab withdraw*/}
                </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
