### Full Truffle CLI
```sh
truffle migrate --reset -f {{from}} --to {{to}} --compile-none --network {{network}}
```

### CMD auto verify SC
*Be sure that you have your secret key of **the chain where you want contract(s) to be deployed to** in **.secret** file.* 
```sh
npm run verify --contract {{contractName}} --network {{network}}
```

### Truffle test
*require node version >= 14*
```sh
truffle test path/to/file --compile-none
```