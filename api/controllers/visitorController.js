'use strict';
const https = require('https');

exports.get_visitor_stats = function(req, res) {
	
	let date = (req.query.date)?parseInt(req.query.date):''; // get the date from url param
	let ignoredMuseum = (req.query.ignore)?(req.query.ignore):''; // if ignored museum is passed in the url
	
	var formatted_date = ''; // use current date as the default date
	let responseJson = {"attendance":[]};
	
	let url = 'https://data.lacity.org/resource/trxm-jn3c.json'; // API to pull visitor stats basis month.
	
	if(date>0){ // if date is passed in the url
		
		formatted_date = new Date(date); // parse the date in int format to avoid data type issue
		responseJson.attendance = {"month":formatted_date.toLocaleString('default', { month: 'long' }),"year":formatted_date.getFullYear()};
		
		// to generate the date in format needed in the API.
		formatted_date = formatted_date.getFullYear()+"-"+(formatted_date.getMonth()+1)+"-"+formatted_date.getDate();
		url = url+'?month='+formatted_date;
	
		// get the visitor stats by making https get call to the endpoint
		https.get(url, (resp) => {
		
			let data = '';
			resp.on('data', (chunk) => {
				data += chunk;
			});

			resp.on('end', () => {
				data = (data)?JSON.parse(data)[0]:[]; // parse the data
				
				if(data){ // if data found for a particular month
					
					let processData =  processStats(data,ignoredMuseum);
					if(processData['highestMuseum']){
						responseJson['attendance']['highest']= {};
						responseJson['attendance']['highest']['museum'] = processData['highestMuseum'];
						responseJson['attendance']['highest']['visitors'] = processData['highestVisitorCount'];
					}
					if(processData['lowestMuseum']){
						responseJson['attendance']['lowest']= {};
						responseJson['attendance']['lowest']['museum'] = processData['lowestMuseum'];
						responseJson['attendance']['lowest']['visitors'] = processData['lowestVisitorCount'];
						
					}
					if(ignoredMuseum){
						responseJson['attendance']['ignored']= {};
						responseJson['attendance']['ignored']['museum'] = processData['ignoredMuseum'];
						responseJson['attendance']['ignored']['visitors'] = processData['ignoredVisitorCount'];
					}
					responseJson['attendance']['total'] = processData['totalVisitorCount'];
				}
				res.json(responseJson); // send the data in return
			});
		}).on("error", (err) => {
			responseJson['error'] = err.message;
			res.json(responseJson); // send the empty json in response
		});
	}
	else{
		responseJson['error'] = 'Date is missing/invalid';
		res.json(responseJson); // send the empty json in response
	}
};


// to process the data and find out highest/lowest visitors in the museum
function processStats(data,ignoredMuseum){
	
	let finalData = {'highestMuseum':'','highestVisitorCount':0,'lowestMuseum':'','lowestVisitorCount':'','ignoredVisitorCount':0,'totalVisitorCount':0};
	
	Object.keys(data).map(key => {
		
		if((parseInt(data[key]) > finalData['highestVisitorCount']) && (key != 'month') && (key != ignoredMuseum)){
			finalData['highestVisitorCount'] = parseInt(data[key]);
			finalData['highestMuseum'] = key;
		}
		
		if(((parseInt(data[key]) < finalData['lowestVisitorCount']) && (key != 'month') && (key != ignoredMuseum)) || (finalData['lowestVisitorCount'] == '' && (key!= 'month') && (key != ignoredMuseum))){
			finalData['lowestVisitorCount'] = parseInt(data[key]);
			finalData['lowestMuseum'] = key;
		}
		
		if(key != 'month' && key == ignoredMuseum){
			finalData['ignoredVisitorCount'] = parseInt(data[key]);
		}
		
		if(key != 'month' && key != ignoredMuseum){
			finalData['totalVisitorCount'] = parseInt(data[key])+finalData['totalVisitorCount'];
		}
	});
	
	return finalData;
}