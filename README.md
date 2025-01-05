# Politinder
You know, sometimes, politics can be a bit overwhelming... So I made this project to help you find the political group that share your values, just like finding your perfect match (like on tinder ahah)!

So in this game/app/quiz/thing, you will have to vote for or against amendments and the app will find your political group.

Amendments are gathered from the french "Assemblée Nationale"'s api (OpenData).
Amendents summaries are generated with Gemini.

## Features
- 📱 Responsive design (works on mobile and desktop)
- 🎯 Match with political groups based on your votes
- 🗳️ Real amendments from the French Assembly (it was hard to get so please vote for this project if you're on highseas)
- 📊 See how your votes align with different political groups
- 🌐 Static (no backend)

## Deploy

Demo in french : https://politinder.pages.dev/
Demo in english (google translate) : https://politinder-pages-dev.translate.goog/?_x_tr_sl=fr&_x_tr_tl=en

You need to serve votes.json, index.html and the parsed_am folder

You can use any static hosting service like:
- ✨ Cloudflare Pages ✨
- GitHub Pages
- Netlify
- Vercel
- ✨ Hackclub's Nest ✨
- Any web server (Apache, Nginx, etc.)

## Acknowledgement

Thanks to:
- The French Assembly for providing the data (even if it's not in the best format)
- Ben Borgers for emojicdn

## License

This project is licensed under the terms of the MIT license.