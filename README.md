Snow Zone
=================

This is an express-based Amazon Alexa app that returns info about current and upcoming Snow Parking bans in Winnipeg.

It was built to run on [glitch.com](glitch.com).

It makes use of the [data.winnipeg.ca apis](https://data.winnipeg.ca/City-Planning/Plow-Zone-Schedule/tix9-r5tc).

## Some endpoints
- https://know-your-zone.glitch.me/
- https://know-your-zone.glitch.me/zone/H

### A note about utterances
To generate utterances in bulk, you can use an [utterance expander tool like this](https://lab.miguelmota.com/intent-utterance-expander/example/)

```
{letter}
zone {letter}
(if there is|is there|when is|when's|to get me|to give me) (|an|a|the) (|next|upcoming) parking ban (|info|information) (|for|in|at|on|about) zone {letter}
(if there is|is there|when is|when's|to get me|to give me) (|an|a|the) (|next|upcoming) parking ban (|info|information)
```
