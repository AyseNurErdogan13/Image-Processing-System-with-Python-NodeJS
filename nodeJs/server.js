const { spawn } = require('child_process');
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');
const path = require('path');

app.use(fileUpload());
app.set('view engine', 'ejs');

function runPythonScript(scriptPath, args) { //python komutunu çalıştıran fonksiyon
    return new Promise((resolve, reject) => {
        const python = spawn('python3', [scriptPath, ...args]); //terminal kodu çalıştırır

        let output = '';
        let error = '';

        python.stdout.on('data', (data) => { //çıktı gelince
            output += data.toString();
        });

        python.stderr.on('data', (data) => { // hata gelince
            error += data.toString();
        });

        python.on('close', (code) => { // işlem tamamlanınca
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(error));
            }
        });
    });
}

app.post('/upload/', async function (req, res) { // sunucuya post işlemi ile foto yüklenme
    let sampleFile, sampleFile2;
    let uploadPath, uploadPath2;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    sampleFile = req.files.sampleFile;
    sampleFile2 = req.files.sampleFile;

    uploadPath = __dirname + '/photos/foto.' + sampleFile.name.split('.').pop();
    uploadPath2 = __dirname + '/photos/foto_2.' + sampleFile.name.split('.').pop();

    sampleFile.mv(uploadPath, function (err) {
        if (err)
            return res.status(500).send(err);

        sampleFile2.mv(uploadPath2, function (err) {
            if (err)
                return res.status(500).send(err);
            res.redirect('/'); // yükleme başarılı olunca anasayfaya yeniden yönlendirir 
        });
    });

});

app.get("/foto", async function (req, res) { // /foto adresine gelen istekle foto2 yi döndürür
    fs.readdir('./photos', (err, files) => {
        if (err) {
            console.error('Klasör okunurken bir hata oluştu:', err);
            return;
        }

        let include_2 = [false, 0];

        for (i = 0; i < files.length; i++) {
            if (files[i].includes("_2")) {
                include_2[0] = true;
                include_2[1] = i;
            }
        }

        include_2[0] ? res.sendFile(__dirname + "/photos/" + files[include_2[1]]) : res.status(404).send('Not found');
    });
})

app.post("/ayar", async function (req, res) { // python scriptini çalıştırır
    runPythonScript("app.py", "deneme", "deneme2").then((result) => { //deneme1 ve deneme2 ayarların durumunu göndermek için oluşturduk
        res.send("ok");
    }).catch((err) => {
        console.log(err);
        res.send("err");
    })
})

app.post("/sil", async function (req, res) { 
    console.log("silme post");

    fs.readdir("photos", (err, files) => {
        if (err) {
            console.error('Klasör okuma hatası:', err);
            res.send("err");
            return;
        }

        files.forEach((file) => {
            const filePath = path.join("photos", file);

            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Dosya silme hatası:', err);
                    res.send("err");
                    return;
                }
            });
        });
        res.send("ok");
    });

})

app.get("/", async function (req, res) { // anasayfa isteği
    fs.readdir('./photos', (err, files) => {
        if (err) {
            console.error('Klasör okunurken bir hata oluştu:', err);
            return;
        }

        if (files.length > 0) { // photos içinde dosya var ise yükleme kısmını aktif ediyor
            res.render("index", { uploaded: true });
        } else {
            res.render("index", { uploaded: false });
        }
    });
})

app.listen(3030);
console.log("Server is running on port 3030");