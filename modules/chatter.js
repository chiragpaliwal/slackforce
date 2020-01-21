"use strict";

let auth = require("./slack-salesforce-auth"),
    force = require("./force"),
    CHATTER_TOKEN = process.env.SLACK_CHATTER;

exports.execute = (req, res) => {

    if (req.body.token != CHATTER_TOKEN) {
        console.log("Invalid token");
        res.send("Invalid token");
        return;
    }

    let slackUserId = req.body.user_id,
        oauthObj = auth.getOAuthObject(slackUserId),
        message = req.body.text,
        body = {"body" : {"messageSegments" : [{"type" : "Text","text" : message }]},"feedElementType" : "FeedItem","subjectId" : "me"};
        //q = "SELECT Id, Name, Phone, BillingAddress FROM Account WHERE Name LIKE '%" + req.body.text + "%' LIMIT 5";

    force.chatter(oauthObj, '', 
    {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        json: true,
        body: body
    })
        .then(data => {
            let sfResponse = JSON.parse(data);
            console.log('##', sfResponse);
            res.send("Chatter Message Posted!");
        })
        .catch(error => {
            if (error.code == 401) {
                res.send(`Visit this URL to login to Salesforce: https://${req.hostname}/login/` + slackUserId);
            } else {
                res.send("Chatter Message Posted!!");
            }
        });
    /*
    force.query(oauthObj, q)
        .then(data => {

            let accounts = JSON.parse(data).records;
            if (accounts && accounts.length>0) {
                let attachments = [];
                accounts.forEach(function(account) {
                    let fields = [];
                    fields.push({title: "Name", value: account.Name, short:true});
                    fields.push({title: "Phone", value: account.Phone, short:true});
                    if (account.BillingAddress) {
                        fields.push({title: "Address", value: account.BillingAddress.street, short:true});
                        fields.push({title: "City", value: account.BillingAddress.city + ', ' + account.BillingAddress.state, short:true});
                    }
                    fields.push({title: "Open in Salesforce:", value: oauthObj.instance_url + "/" + account.Id, short:false});
                    attachments.push({color: "#7F8DE1", fields: fields});
                });
                res.json({text: "Accounts matching '" + req.body.text + "':", attachments: attachments});
            } else {
                res.send("No records");
            }
            
        })
        .catch(error => {
            if (error.code == 401) {
                res.send(`Visit this URL to login to Salesforce: https://${req.hostname}/login/` + slackUserId);
            } else {
                res.send("An error as occurred");
            }
        });

    */
};