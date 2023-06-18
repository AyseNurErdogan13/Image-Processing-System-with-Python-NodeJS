const { spawn } = require('child_process');
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');
const path = require('path');

app.use(fileUpload());
app.set('view engine', 'ejs');
app.use(express.json());

var settings = [ //varsayılan ayarlar 
    {
        "name": "clahe_image",
        "title": "CLAHE",
        "sub_settings": [
            {
                "name": "clipLimit",
                "title": "Clip Limit",
                "type": "range",
                "min": 0,
                "max": 40,
                "step": 1,
                "value": 2.0 // settings[0]["sub_settings"][0]["value"]
            },
            {
                "name": "tileGridSize",
                "title": "Tile Grid Size",
                "type": "range",
                "min": 1,
                "max": 40,
                "step": 1,
                "value": 16
            }
        ]
    },
    {
        "name": "awb",
        "title": "Auto White Balance",
        "sub_settings": [
            {
                "name": "setP",
                "title": "Set P",
                "type": "range",
                "min": 0,
                "max": 4,
                "step": 0.1,
                "value": 0.4
            },
            {
                "name": "SaturationThreshold",
                "title": "Saturation Threshold",
                "type": "range",
                "min": 0,
                "max": 4,
                "step": 0.1,
                "value": 0.9
            },
            {
                "name": "SaturationThreshold2",
                "title": "Saturation Threshold 2",
                "type": "range",
                "min": 0,
                "max": 4,
                "step": 0.1,
                "value": 0.99
            }
        ]
    }
]

var currentSettings = JSON.parse(JSON.stringify(settings));

function runPythonScript(scriptPath, args) {
    return new Promise((resolve, reject) => {
        const python = spawn('python3', [scriptPath, ...args]);

        let output = '';
        let error = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.stderr.on('data', (data) => {
            error += data.toString();
        });

        python.on('close', (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(error));
            }
        });
    });
}

app.post('/upload/', async function (req, res) {  //Fotoğraf yükleme
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
            res.redirect('/');
        });
    });

});

app.get("/foto", async function (req, res) { //Fotoğrafı gönderme
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

app.post("/ayar", async function (req, res) { //Ayarları uygulama
    currentSettings = req.body.newSettings;

    runPythonScript("app.py", JSON.stringify(currentSettings)).then((result) => { //Python scriptini çalıştırma
        //console.log(result);
        res.send("ok");
    }).catch((err) => {
        console.log(err);
        res.send("err");
    })
})

app.post("/sil", async function (req, res) { //Fotoğrafı silme
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
        currentSettings = JSON.parse(JSON.stringify(settings));
        res.send("ok");
    });

})

app.get("/", async function (req, res) { //Ana sayfa
    fs.readdir('./photos', (err, files) => {
        if (err) {
            console.error('Klasör okunurken bir hata oluştu:', err);
            return;
        }

        if (files.length > 0) { //photos klasörü boş değilse
            res.render("index", { uploaded: true, settings: currentSettings });
        } else {
            res.render("index", { uploaded: false, settings: settings });
        }
    });
})

app.listen(3030);
console.log("Server is running on port 3030");