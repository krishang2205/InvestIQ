import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetDir = path.join(__dirname, 'public/assets/logos');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const logos = {
    "adani.png": "https://logo.clearbit.com/adani.com",
    "tata.png": "https://logo.clearbit.com/tatasteel.com",
    "infosys.png": "https://logo.clearbit.com/infosys.com",
    "reliance.png": "https://logo.clearbit.com/ril.com",
    "hdfc.png": "https://logo.clearbit.com/hdfcbank.com",
    "wipro.png": "https://logo.clearbit.com/wipro.com",
    "techm.png": "https://logo.clearbit.com/techmahindra.com",
    "coalindia.png": "https://logo.clearbit.com/coalindia.in",
    "ntpc.png": "https://logo.clearbit.com/ntpc.co.in",
    "hul.png": "https://logo.clearbit.com/hul.co.in",
    "upl.png": "https://logo.clearbit.com/upl-ltd.com",
    "icici.png": "https://logo.clearbit.com/icicibank.com",
    "kotak.png": "https://logo.clearbit.com/kotak.com"
};

const download = (url, dest) => {
    const file = fs.createWriteStream(dest);
    https.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(() => console.log('Downloaded ' + dest));
        });
    }).on('error', function (err) {
        fs.unlink(dest);
        console.error('Error downloading ' + url, err.message);
    });
};

Object.entries(logos).forEach(([filename, url]) => {
    download(url, path.join(targetDir, filename));
});
