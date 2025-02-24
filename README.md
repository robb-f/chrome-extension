# AI Autocomplete Chrome Extension
A simple Chrome extension that uses Ollama Mistral in order to provide suggestions.

## Requirements
First, you should download a local copy of Ollama for this to work. On Windows, please
download the most recent/stable version [here](https://ollama.com/). For Mac/Linux run:
```
    brew install ollama
```

Then pull the Mistral model:
```
    ollama pull mistral
```

Please allow approximately 5 minutes for installation.

In order for the Ollama to interact, we must use a remote server. Later functionality
may be added to accommodate premium users of other LLMs, such as OpenAI or Gemini.
However, to launch the remote server, `cd` into this git repository on your local machine
and run
```
    node server.js
```

You should see `Ollama Proxy Server is Running!` printed on the page. Make sure this server
does not terminate.

## Usage
This repository can be uploaded to Google Chrome easily!
- Visit [chrome://extensions/](chrome://extensions/)
- Enable **Developer Mode**, which can (usually) be found on the top right corner
- Click the "Load unpacked" button and select the root folder of this repository
- You will now see AutoComplete Extension installed.

Currently, this is designed to work perfectly on [https://wordcounter.net/](https://wordcounter.net/),
so I will work on making this suggestion feature work generally on any website's textarea element.