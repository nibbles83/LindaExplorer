This explorer is forked from Luke's Explorer v1.6.1 (https://github.com/iquidus/explorer) with a bit of flavoring from https://github.com/masterhash-us/Explorer, which seems to be gone now. 

### Latest Updates:

#### 28/08/2018
*  Added script to find and remove orphan blocks from the DB. Use crontab to run it at interval.

#### 28/08/2018
*  Tweaks of Bleutrade script to allow arbitrage.

#### 15/08/2018
*  Addition of BTC-Alpha market.
*  Formatting fix for Graviex market.

#### 14/08/2018
*  Addition of Exchange markets arbitration data.
*  Bugfix in rewards page for displaying small values.
*  Change of Cryptopia 24hr volume stats to BTC

#### 08/08/2018
*  Added Rewards tab, crontab script processes last 6 hours(configurable) of PoS rewards. Rewards are calculated as either "stake" or "masternode" based on the rewards size(it is assumed masternodes receive the larger cut.) 
*  Upgrade of datatables version to better cope with mobile devices and smaller screen sizes.
*  Reworked the nav-bar so overlapping doesn't occur on small screen devices when lots of menu items are enabled.
*  Moved current block count and connections to the network display pane.
*  Added Graviex market support
*  Added Goolge Analytics support (Modify your ID in public/javascripts/analytics.js)
*  Added Goolge Adsense support (Modify your ID in public/javascripts/ads.js)
*  Coinexchange market improvement to group buys & sells.
*  Bugfix for issues during reindex command usage
*  Bugfix for issue when orphan blocks were getting submitted to the DB.
*  version increment

#### 31/05/2018
*  Added Coinexchange market support

#### 29/05/2018
*  Added SSL support (Put your root, crt and key files in the root explorer folder. Name them correctly, ssl.key, ssl.cer & root.cer)

#### 17/05/2018
*  Added integration with custom Linda wallet RPC masternode commands.
*  Added Linda Masternodes update/cleanup script in native node.js 

Linda Explorer - 1.7.2
================

An open source block explorer written in node.js.

### Requires

*  node.js >= 0.10.28
*  mongodb 2.6.x
*  *coind

### Create database

Enter MongoDB cli:

    $ mongo

Create databse:

    > use explorerdb

Create user with read/write access:

    > db.createUser( { user: "iquidus", pwd: "3xp!0reR", roles: [ "readWrite" ] } )

*note: If you're using mongo shell 2.4.x, use the following to create your user:

    > db.addUser( { user: "username", pwd: "password", roles: [ "readWrite"] })

### Get the source

    git clone https://github.com/nibbles83/LindaExplorer

### Install node modules

    cd explorer && npm install --production

### Configure

    cp ./settings.json.template ./settings.json

*Make required changes in settings.json*

### Start Explorer

    npm start

### To start in production mode, this improves performance, due to less logging.

    NODE_ENV=production npm start

*note: mongod must be running to start the explorer*

As of version 1.4.0 the explorer defaults to cluster mode, forking an instance of its process to each cpu core. This results in increased performance and stability. Load balancing gets automatically taken care of and any instances that for some reason die, will be restarted automatically. For testing/development (or if you just wish to) a single instance can be launched with

    node --stack-size=10000 bin/instance

To stop the cluster you can use

    npm stop

### Syncing databases with the blockchain

sync.js (located in scripts/) is used for updating the local databases. This script must be called from the explorers root directory.

    Usage: node scripts/sync.js [database] [mode]

    database: (required)
    index [mode] Main index: coin info/stats, transactions & addresses
    market       Market data: summaries, orderbooks, trade history & chartdata

    mode: (required for index database only)
    update       Updates index from last sync to current block
    check        checks index for (and adds) any missing transactions/addresses
    reindex      Clears index then resyncs from genesis to current block

    notes:
    * 'current block' is the latest created block when script is executed.
    * The market database only supports (& defaults to) reindex mode.
    * If check mode finds missing data(ignoring new data since last sync),
      index_timeout in settings.json is set too low.


*It is recommended to have this script launched via a cronjob at 1+ min intervals.*

**crontab**

*Example crontab; update index every minute and market data every 2 minutes*

    */1 * * * * cd /path/to/explorer && /usr/bin/nodejs scripts/sync.js index update > /dev/null 2>&1
    */2 * * * * cd /path/to/explorer && /usr/bin/nodejs scripts/sync.js market > /dev/null 2>&1
    */2 * * * * cd /path/to/explorer && /usr/bin/nodejs scripts/rewards.js update > /dev/null 2>&1
    */5 * * * * cd /path/to/explorer && /usr/bin/nodejs scripts/peers.js > /dev/null 2>&1

*The below crontab entry populates the database using rpc command "masternode status-all". This RPC is custom made and will only work when built from my Linda wallet repository (https://github.com/nibbles83/Linda). Future official Linda version may also contain something similar.*

    */5 * * * * cd /root/explorer_2 && /usr/bin/nodejs scripts/lindamasternodes.js clean > /dev/null 2>&1
    */5 * * * * cd /root/explorer_2 && /usr/bin/nodejs scripts/lindamasternodes.js update > /dev/null 2>&1

### Wallet

Iquidus Explorer is intended to be generic so it can be used with any wallet following the usual standards. The wallet must be running with atleast the following flags

    -daemon -txindex

### Donate (Left Luke's addresses, please contribute!)  
Nibbles Address
    LINDA: LYbCX9gmBdAJXWGrnoKkZb1xWR5ixBAemY
    BTC: 37UjqmVFXAxYxcQUGk9ayDvCHgdCQGPe7R

Lukes Addresses
    BTC: 168hdKA3fkccPtkxnX8hBrsxNubvk4udJi
    JBS: JZp9893FMmrm1681bDuJBU7c6w11kyEY7D (no longer valid, use BTC address)

### Known Issues

**script is already running.**

If you receive this message when launching the sync script either a) a sync is currently in progress, or b) a previous sync was killed before it completed. If you are certian a sync is not in progress remove the index.pid from the tmp folder in the explorer root directory.

    rm tmp/index.pid

**exceeding stack size**

    RangeError: Maximum call stack size exceeded

Nodes default stack size may be too small to index addresses with many tx's. If you experience the above error while running sync.js the stack size needs to be increased.

To determine the default setting run

    node --v8-options | grep -B0 -A1 stack_size

To run sync.js with a larger stack size launch with

    node --stack-size=[SIZE] scripts/sync.js index update

Where [SIZE] is an integer higher than the default.

*note: SIZE will depend on which blockchain you are using, you may need to play around a bit to find an optimal setting*

### License

Copyright (c) 2015, Iquidus Technology  
Copyright (c) 2015, Luke Williams  
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Iquidus Technology nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
# LindaExplorer
