/*
   This extension was made with DinoBuilder!
   https://dinobuilder.vercel.app/
*/
(async function(Scratch) {
    const variables = {};
    const blocks = [];
    const menus = {};


    if (!Scratch.extensions.unsandboxed) {
        alert("This extension needs to be unsandboxed to run!")
        return
    }

    function doSound(ab, cd, runtime) {
        const audioEngine = runtime.audioEngine;

        const fetchAsArrayBufferWithTimeout = (url) =>
            new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                let timeout = setTimeout(() => {
                    xhr.abort();
                    reject(new Error("Timed out"));
                }, 5000);
                xhr.onload = () => {
                    clearTimeout(timeout);
                    if (xhr.status === 200) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error(`HTTP error ${xhr.status} while fetching ${url}`));
                    }
                };
                xhr.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error(`Failed to request ${url}`));
                };
                xhr.responseType = "arraybuffer";
                xhr.open("GET", url);
                xhr.send();
            });

        const soundPlayerCache = new Map();

        const decodeSoundPlayer = async (url) => {
            const cached = soundPlayerCache.get(url);
            if (cached) {
                if (cached.sound) {
                    return cached.sound;
                }
                throw cached.error;
            }

            try {
                const arrayBuffer = await fetchAsArrayBufferWithTimeout(url);
                const soundPlayer = await audioEngine.decodeSoundPlayer({
                    data: {
                        buffer: arrayBuffer,
                    },
                });
                soundPlayerCache.set(url, {
                    sound: soundPlayer,
                    error: null,
                });
                return soundPlayer;
            } catch (e) {
                soundPlayerCache.set(url, {
                    sound: null,
                    error: e,
                });
                throw e;
            }
        };

        const playWithAudioEngine = async (url, target) => {
            const soundBank = target.sprite.soundBank;

            let soundPlayer;
            try {
                const originalSoundPlayer = await decodeSoundPlayer(url);
                soundPlayer = originalSoundPlayer.take();
            } catch (e) {
                console.warn(
                    "Could not fetch audio; falling back to primitive approach",
                    e
                );
                return false;
            }

            soundBank.addSoundPlayer(soundPlayer);
            await soundBank.playSound(target, soundPlayer.id);

            delete soundBank.soundPlayers[soundPlayer.id];
            soundBank.playerTargets.delete(soundPlayer.id);
            soundBank.soundEffects.delete(soundPlayer.id);

            return true;
        };

        const playWithAudioElement = (url, target) =>
            new Promise((resolve, reject) => {
                const mediaElement = new Audio(url);

                mediaElement.volume = target.volume / 100;

                mediaElement.onended = () => {
                    resolve();
                };
                mediaElement
                    .play()
                    .then(() => {
                        // Wait for onended
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });

        const playSound = async (url, target) => {
            try {
                if (!(await Scratch.canFetch(url))) {
                    throw new Error(`Permission to fetch ${url} denied`);
                }

                const success = await playWithAudioEngine(url, target);
                if (!success) {
                    return await playWithAudioElement(url, target);
                }
            } catch (e) {
                console.warn(`All attempts to play ${url} failed`, e);
            }
        };

        playSound(ab, cd)
    }

    const ExtForge_Utils = {
        // from https://jwklong.github.io/extforge
        Broadcasts: new function() {
            this.raw_ = {};
            this.register = (name, blocks) => {
                this.raw_[name] = blocks;
            };
            this.execute = async (name) => {
                if (this.raw_[name]) {
                    await this.raw_[name]();
                };
            };
        }
    }
    class Extension {
        getInfo() {
            return {
                "id": "waitutils",
                "name": "Wait utils",
                "color1": "#ffab19",
                "color2": "#ec9c13",
                "tbShow": true,
                "blocks": blocks,
                "menus": menus
            }
        }
    }
    menus["time"] = {
        acceptReporters: false,
        items: ["miliseconds", "seconds", "minutes", "hours", "days"]
    }

    blocks.push({
        opcode: `custim`,
        blockType: Scratch.BlockType.COMMAND,
        hideFromPalette: false,
        text: `wait [mili] [anny]`,
        arguments: {
            "mili": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 10,
            },
            "anny": {
                type: Scratch.ArgumentType.STRING,
                menu: 'time'
            },
        },
        disableMonitor: true
    });
    Extension.prototype[`custim`] = async (args, util) => {
        if ((args["anny"] == 'miliseconds')) {
            await new Promise(resolve => setTimeout(resolve, args["mili"]))
        } else if ((args["anny"] == 'seconds')) {
            await new Promise(resolve => setTimeout(resolve, (args["mili"] * 1000 / 1)))
        } else if ((args["anny"] == 'minutes')) {
            await new Promise(resolve => setTimeout(resolve, (args["mili"] * 60000 / 1)))
        } else if ((args["anny"] == 'hours')) {
            await new Promise(resolve => setTimeout(resolve, (args["mili"] * 3600000 / 1)))
        } else if ((args["anny"] == 'days')) {
            await new Promise(resolve => setTimeout(resolve, (args["mili"] * 86400000 / 1)))
        };
    };

    blocks.push({
        blockType: Scratch.BlockType.XML,
        xml: `<sep gap='24'/>`,
    });

    blocks.push({
        opcode: `untilleapyear`,
        blockType: Scratch.BlockType.COMMAND,
        hideFromPalette: false,
        text: `wait until leap year`,
        arguments: {},
        disableMonitor: true
    });
    Extension.prototype[`untilleapyear`] = async (args, util) => {
        await new Promise(resolve => {
            let x = setInterval(() => {
                if (((new Date(new Date(Date.now()).getYear(), 1, 29)).getDate() === 29)) {
                    clearInterval(x);
                    resolve()
                }
            }, 50)
        })
    };

    blocks.push({
        opcode: `waitwhile`,
        blockType: Scratch.BlockType.COMMAND,
        hideFromPalette: false,
        text: `wait while [boolean]`,
        arguments: {
            "boolean": {
                type: Scratch.ArgumentType.BOOLEAN,
            },
        },
        disableMonitor: true
    });
    Extension.prototype[`waitwhile`] = async (args, util) => {
        await new Promise(resolve => {
            let x = setInterval(() => {
                if (!args["boolean"]) {
                    clearInterval(x);
                    resolve()
                }
            }, 50)
        })
    };

    blocks.push({
        opcode: `waitfocused`,
        blockType: Scratch.BlockType.COMMAND,
        hideFromPalette: false,
        text: `wait until the user focused`,
        arguments: {},
        disableMonitor: true
    });
    Extension.prototype[`waitfocused`] = async (args, util) => {
        await new Promise(resolve => {
            let x = setInterval(() => {
                if (document.hasFocus()) {
                    clearInterval(x);
                    resolve()
                }
            }, 50)
        })
    };

    blocks.push({
        blockType: Scratch.BlockType.XML,
        xml: `<sep gap='24'/>`,
    });

    blocks.push({
        opcode: `waituntilrandom`,
        blockType: Scratch.BlockType.COMMAND,
        hideFromPalette: false,
        text: `wait until the random boolean chooses true`,
        arguments: {},
        disableMonitor: true
    });
    Extension.prototype[`waituntilrandom`] = async (args, util) => {
        (async () => {
            while (true) {
                if (Boolean(Math.round(Math.random()))) {
                    break;
                };

                await new Promise(r => setTimeout(r, 50));
            }
        })()
    };
    blocks.push({
        opcode: `waitframes`,
        blockType: Scratch.BlockType.COMMAND,
        hideFromPalette: false,
        text: `wait [frameless] frames`,
        arguments: {
            "frameless": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 10,
            },
        },
        disableMonitor: true
    });
    Extension.prototype[`waitframes`] = async (args, util) => {
        await new Promise(resolve => setTimeout(resolve, ((args["frameless"] * 1000 / 1) / 30)))
    };

    Scratch.extensions.register(new Extension());
})(Scratch);
