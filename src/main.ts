import "dotenv/config";
import { connectFeed } from "./websocket.js";

function main() {
    connectFeed((data) => {
        //const result = validate(data);
        //console.log(result.ok ? "ACCEPT" : "REJECT");
    });
}

main();
