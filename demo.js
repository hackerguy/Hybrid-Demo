var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var Cloudant = require('cloudant')({account:'rich', key:'mallialterervanderstunds',password:'jgTSqLmYE5yoOnps0Hfdr3ed'});
var db = Cloudant.use("employee");

/*require the ibm_db module*/
var ibmdb = require('ibm_db');

// set up handlebars view engine
var handlebars = require('express3-handlebars')
         .create({defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

app.get("/", function(req,res){
  res.render('form');
});

app.post('/', urlencodedParser, function (req, res) {
  	if (!req.body) return res.sendStatus(400)
  	var firstnme = req.body.firstnme;
  	var lastname = req.body.lastname;
  	var fullname = firstnme+" "+lastname;
  		db.search('DesignDoc', 'lookupbyname', {q:'firstnme:'+firstnme+' AND lastname:'+lastname}, function(err, cloudant_result) {
  			if (typeof cloudant_result.rows[0] === 'undefined') {
                		Cloudant_email = "Name not found in Cloudant database";
                	} else {
                        Cloudant_email = cloudant_result.rows[0].fields.email;
                    }
  		console.log(Cloudant_email);
	
	ibmdb.open("DRIVER={DB2};DATABASE=sample;UID=db2inst1;PWD=password;HOSTNAME=DB-Ubuntu-VirtualBox;port=50000", function(err, conn)
	{
        if(err) {
                /*
                  On error in connection, log the error message on console
                */
                console.error("error: ", err.message);
        } else {
                conn.query("select JOB from employee where FIRSTNME="+"\'"+firstnme+"\'"+" and LASTNAME="+"\'"+lastname+"\'", function(err, db2_result) {
                	if (typeof db2_result[0] === 'undefined') {
                		db2_jobresult = "Name not found in DB2 database";
                	} else {
                        db2_jobresult = (db2_result[0].JOB);
                    }  
 	console.log(db2_jobresult);               
 res.render('response', { name: fullname, job: db2_jobresult, email: Cloudant_email });               
                });
        }
	});
	});
});


// 404 catch-all handler (middleware)
app.use(function(req, res, next){
res.status(404);
res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
console.error(err.stack);
res.status(500);
res.render('500');
});

app.listen(app.get('port'), function(){
  console.log( 'Express started on http://localhost:' +
    app.get('port') + '; press Ctrl-C to terminate.' );
});
