// services/playfabService.js
require('dotenv').config();

const PlayFab = require("playfab-sdk");

PlayFab.settings.titleId = process.env.PLAYFAB_TITLE_ID;
PlayFab.settings.developerSecretKey = process.env.PLAYFAB_SECRET;

console.log(process.env.PLAYFAB_TITLE_ID);
console.log(process.env.PLAYFAB_SECRET);


// Add coins
exports.addCoins = async (playerId, amount) => {
    return new Promise((resolve, reject) => {

        console.log("PLAYFAB API CALLED");

        PlayFab.PlayFabServer.AddUserVirtualCurrency(
            {
                PlayFabId: playerId,
                VirtualCurrency: "RP",
                Amount: amount
            },
            (error, result) => {
                if (error) {
                    console.error("PlayFab error:", JSON.stringify(error, null, 2));
                    return reject(error);
                }
                console.log(`Coins added to ${playerId}: ${amount}`);
                resolve(result);
            }
        );
    });
};


// VIP membership
exports.addVipMembership = async (playerId) => {

    return new Promise((resolve, reject) => {

        // Step 1: mark player as VIP
        PlayFab.PlayFabServer.UpdateUserData(
            {
                PlayFabId: playerId,
                Data: {
                    PaidUser: "true"
                }
            },
            (error) => {

                if (error) {
                    console.error("PlayFab VIP error:", error);
                    return reject(error);
                }

                console.log("VIP activated");

                // Step 2: grant 580 bonus coins
                PlayFab.PlayFabServer.AddUserVirtualCurrency(
                    {
                        PlayFabId: playerId,
                        VirtualCurrency: "RP", // your currency code
                        Amount: 550
                    },
                    (error, result) => {

                        if (error) {
                            console.error("VIP bonus coin error:", error);
                            reject(error);
                        } else {
                            console.log("VIP bonus granted: 550 coins");
                            resolve(result);
                        }

                    }
                );

            }
        );

    });

};
