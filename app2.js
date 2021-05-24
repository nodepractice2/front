var express = require('express');
var app = express();
var db_config = require(__dirname + '/config/database.js');
var conn = db_config.init();
var bodyParser = require('body-parser');
var a = 0; // 글번호
var msg = require('dialog');
var path = require('path');


db_config.connect(conn);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(__dirname + '/views'));


app.get('/', function (req, res) {
        res.render('main.ejs');
    });

app.get('/test', function (req, res) {
        res.render('test.ejs');
    });

app.get('/login', function (req, res) {
    res.render('login.ejs');
});

app.get('/join', function (req, res){
    res.render('join.ejs')
});

app.get('/list', function (req, res) {
    var sql = 'SELECT * FROM BOARD';    
    conn.query(sql, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else res.render('list.ejs', {list : rows});
    });
    
});

app.get('/write', function (req, res) {
    res.render('write.ejs');
});

app.post('/delete' , function( req, res) {
    var body = req.body;
    var query = req.query;
    console.log(req.query);
    console.log(req.num);
    console.log(body.num);

    var sql = 'delete from BOARD where rownum = ?';
    var params = [body.rownum] ;
    console.log(sql);
    conn.query(sql, params, function(err) {
        if(err) console.log('query is not excuted. insert fail...\n' + err);
        else res.redirect('/list');
    })

})

app.post('/writeAf', function (req, res) {
    var sql = 'SELECT MAX(rownum) as max FROM BOARD';    
    conn.query(sql, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else console.log(a=rows[0].max);
        a++;
        console.log(a);

        var body = req.body;
        sql = 'INSERT INTO BOARD VALUES(?, NOW(), ?, ?, ?)';
        var params = [body.id, body.title, a, body.content];
        console.log(sql);
        conn.query(sql, params, function(err) {
            if(err) console.log('query is not excuted. insert fail...\n' + err);
             else res.redirect('/list');
        });
    });

    
});


app.post('/join', function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var apassword = req.body.apassword;
    var introduce = req.body.introduce

    if(!username || !password || !email || !apassword ||!introduce){
        //하나라도 누락된 경우
        msg.info('모든 정보를 입력해 주세요')
            return;
         }
    
        if(password != apassword){
            msg.info('비밀번호가 같지 않습니다')
            return;
        }
    

    var sql = 'insert into user (id,password,email,introduce) values(?,?,?,?)';
    var params = [username,password,email,introduce];

    conn.query(sql,params,function(err,rows,fields){
        if(err)
        console.log(err);
           
         else
        console.log(rows);
        msg.info('회원가입 완료')
        res.redirect('/login');
                
    });
});

app.post('/login', function(req,res){
    var email = req.body.email;
    var password = req.body.password;

    var sql = 'select * from user where email = ?'
    var params = [email];

    conn.query(sql,params, function(err,rows,fields){
        var user = rows[0];
        console.log(rows);
        // if(rows === 0){
        //     console.log('s');
        // }
        if(rows.length == 0){
            //이메일이 존재하지 않으면
            res.send("emailerror");
            msg.info('존재 하지 않는 이메일 입니다.');

            
            return;
        } 
        if(user.password !== password){
            //패스워드 틀리면
            res.send("passwderror");
        return;
        } 
        if(user.password == password){
            //이메일 패스워드 둘다 맞으면
            res.redirect("/");
        }
    });
});


app.post('/join/check', function(req,res){
    var email = req.body.email;
    
    var sql = 'SELECT * FROM user WHERE email = ?';   
    conn.query(sql, email,function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else{
             
            if(rows.length == 0){
            res.send("ok");
            } else if(rows.length == 1){
            res.send("not");
            }else {
                res.send("ok");
            }
            
        }
    });
})
app.listen(3000, function(){
    console.log('Server is running on port 3000...')
}) ;
