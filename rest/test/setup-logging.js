const SegfaultHandler = require('segfault-handler');


exports.mochaGlobalSetup = async function () {
    console.log("Setting up logging");
    SegfaultHandler.registerHandler("crash.log", function(signal, address, stack) {
        console.log("segfault captured");
        console.log(stack);
    });
};