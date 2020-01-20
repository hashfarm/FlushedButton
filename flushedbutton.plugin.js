//META{"name":"FlushedButton","displayName":"Flushed Button","website":"https://github.com/ProtoGrace/FlushedButton/blob/master/flushedbutton.plugin.js","source":"https://raw.githubusercontent.com/ProtoGrace/FlushedButton/master/flushedbutton.plugin.js"}*//
/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();

@else@*/

var FlushedButton = (() => {
     const config = {"info":{"name":"Flushed Button","authors":[{"name":"Proto","discord_id":"617130693511741460","github_username":"ProtoGrace","twitter_username":"ProtoGrace"}],"version":"0.0.3","description":"Button that sends flushed emoji.","github":"https://github.com/ProtoGrace/FlushedButton","github_raw":"https://raw.githubusercontent.com/ProtoGrace/FlushedButton/master/flushedbutton.plugin.js"},"changelog":[{"title":"Modified","type":"fixed","items":["Added Image Url Settings."]}],"main":"index.js"};
     const minDIVersion = '1.12';
    if (!window.DiscordInternals || !window.DiscordInternals.version ||
        window.DiscordInternals.versionCompare(window.DiscordInternals.version, minDIVersion) < 0) {
        const message = `Lib Discord Internals v${minDIVersion} or higher not found! Please install or upgrade that utility plugin. See install instructions here https://goo.gl/kQ7UMV`;
        Api.log(message, 'warn');
        return (class EmptyStubPlugin extends Plugin {
            onStart() {
                Api.log(message, 'warn');
                alert(message);
                return false;
            }

            onStop() {
                return true;
            }
        });
    }

    const {WebpackModules} = window.DiscordInternals;

    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            const title = "Library Missing";
            const ModalStack = BdApi.findModuleByProps("push", "update", "pop", "popWithKey");
            const TextElement = BdApi.findModuleByProps("Sizes", "Weights");
            const ConfirmationModal = BdApi.findModule(m => m.defaultProps && m.key && m.key() == "confirm-modal");
            if (!ModalStack || !ConfirmationModal || !TextElement) return BdApi.alert(title, `The library plugin needed for ${config.info.name} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
            ModalStack.push(function(props) {
                return BdApi.React.createElement(ConfirmationModal, Object.assign({
                    header: title,
                    children: [TextElement({color: TextElement.Colors.PRIMARY, children: [`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`]})],
                    red: false,
                    confirmText: "Download Now",
                    cancelText: "Cancel",
                    onConfirm: () => {
                        require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                            if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                            await new Promise(r => require("fs").writeFile(require("path").join(ContentManager.pluginsFolder, "0PluginLibrary.plugin.js"), body, r));
                        });
                    }
                }, props));
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Api) => {
    const css = `.send-button {
	width: 23.5px;
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	right: 2px;
	top: 10px;
}

.send-button img {
	opacity: 0.5;
	width: 100%;
	transition: all 200ms ease;
}

.send-button img:hover {
	cursor: pointer;
	opacity: 1;
	transform:scale(1.1);
}`;
    

    const press = new KeyboardEvent("keydown", {key: "Enter", code: "Enter", which: 13, keyCode: 13, bubbles: true});
    Object.defineProperties(press, {keyCode: {value: 13}, which: {value: 13}});

    const {DiscordSelectors, PluginUtilities, DOMTools, Logger, Settings} = Api;
    return class FlushedButton extends Plugin {
        constructor() {
            super();
            this.defaultSettings = {};
            this.defaultSettings.imageurl = "https://i.imgur.com/uFfJbzD.png";
        }

        getSettingsPanel() {
            return Settings.SettingPanel.build(this.saveSettings.bind(this), 
                new Settings.SettingGroup("Flushed Button Settings").append(
                    new Settings.Textbox("Textbox", "Image URL to send", this.settings.imageurl, (e) => {this.settings.imageurl = e;}), (e) => {this.settings.option = e;})
            );
        }


        onStart() {
            PluginUtilities.addStyle(this.getName(), css);
            if (document.querySelector("form")) this.addButton(document.querySelector("form"));
        }
        
        onStop() {
            const button = document.querySelector(".send-button");
            if (button) button.remove();
            PluginUtilities.removeStyle(this.getName());
        }



        addButton(elem) {
            const buttonHTML = `<div class="send-button">
                <img src="`+ this.settings.imageurl + ` ">
            </div>`;
            if (elem.querySelector(".send-button")) return;
            const button = DOMTools.createElement(buttonHTML);
            const form = elem.querySelector(DiscordSelectors.Textarea.inner);
            form.append(button);
            if (form.querySelector("[class*=\"emojiButton-\"]")) form.querySelector("[class*=\"emojiButton-\"]").css("margin-right", (button.outerWidth() + 15) + "px");
            button.on("click", () => {
                const textareaWrapper = form.querySelector(DiscordSelectors.Textarea.textArea);
                if (!textareaWrapper) return Logger.warn("Could not find textarea wrapper");

                const textarea = textareaWrapper.children && textareaWrapper.children[0];
                if (!textarea) return Logger.warn("Could not find textarea");

                const MessageActions = WebpackModules.findByUniqueProperties(['jumpToMessage', '_sendMessage']);
                var currentChannel = window.location.pathname.split('/').pop();
                MessageActions.sendMessage(currentChannel, {content: this.settings.imageurl});
            });
        }

        observer(e) {
            if (!e.addedNodes.length || !(e.addedNodes[0] instanceof Element)) return;
            if (e.addedNodes[0].querySelector(DiscordSelectors.Textarea.inner)) {
                this.addButton(e.addedNodes[0]);
            }
        }

    };
};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
