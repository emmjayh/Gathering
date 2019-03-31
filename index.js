module.exports = function Gathering(mod) {
	
	const plants = {
		1: {name:'Special', msg:'Harmony Grass'},
		2: {name:'Plant', msg:'Cobseed'},
		3: {name:'Plant', msg:'Veridia Root'},
		4: {name:'Plant', msg:'Orange Mushroom'},
		5: {name:'Plant', msg:'Moongourd Pumpkin'},
		6: {name:'Plant', msg:'Apple Tree'}
	}
	const mining = {
		101: {name:'Special', msg:'Plain Stone'},
		102: {name:'Ore', msg:'Cobalt Ore'},
		103: {name:'Ore', msg:'Shadmetal'},
		104: {name:'Ore', msg:'Xermetal'},
		105: {name:'Ore', msg:'秘银Ore'},
		106: {name:'Ore', msg:'Glaborne Ore'}
	}
	const energy = {
		201: {name:'Special', msg:'Achromic'},
		202: {name:'Essence', msg:'Crimson Essence'},
		203: {name:'Essence', msg:'Earth Essence'},
		204: {name:'Essence', msg:'Azure Essence'},
		205: {name:'Essence', msg:'Opal Essence'},
		206: {name:'Essence', msg:'Obsidian Essence'}
	}
	
	let {
		enabled,
		sendToAlert,
		sendToNotice,
	} = require('./config.json')
	
	let plantsMarkers = false,
		miningMarkers = false,
		energyMarkers = false,
		othersMarkers = false,
		mobid = []
	
	mod.command.add('collection', (arg) => {
		if (!arg) {
			enabled = !enabled;
			if (!enabled) {
				plantsMarkers = false
				miningMarkers = false
				energyMarkers = false
				for (let itemId of mobid) {
					despawnItem(itemId)
				}
			}
			sendMessage('Module ' + (enabled ? BLU('On') : YEL('Off')))
		} else {
			switch (arg) {
				case "warn":
					sendToAlert = !sendToAlert
					sendMessage('Warning ' + (sendToAlert ? BLU('Enable') : YEL('Disable')))
					break
				case "notice":
					sendToNotice = !sendToNotice
					sendMessage('Notification ' + (sendToNotice ? BLU('Enable') : YEL('Disable')))
					break
					
				case "status":
					gatheringStatus()
					break
				
				case "plant":
					plantsMarkers = !plantsMarkers
					sendMessage('Gather ' + (plantsMarkers ? BLU('Display') : YEL('Hide')))
					break
				case "ore":
					miningMarkers = !miningMarkers
					sendMessage('Mine ' + (miningMarkers ? BLU('Display') : YEL('Hide')))
					break
				case "essence":
					energyMarkers = !energyMarkers
					sendMessage('Energy ' + (energyMarkers ? BLU('Display') : YEL('Hide')))
					break
				
				default :
					sendMessage(RED('Invalid argument!'))
					break
			}
		}
	})
	
	mod.hook('S_LOAD_TOPO', 3, (event) => {
		mobid = []
	})
	
	mod.hook('S_SPAWN_COLLECTION', 4, (event) => {
		if (enabled) {
			if (plantsMarkers && plants[event.id]) {
				alertMessage('Find [' + plants[event.id].name + '] ' + plants[event.id].msg)
				noticeMessage('Find [' + plants[event.id].name + '] ' + plants[event.id].msg)
			}
			else if (miningMarkers && mining[event.id]) {
				alertMessage('Find [' + mining[event.id].name + '] ' + mining[event.id].msg)
				noticeMessage('Find [' + mining[event.id].name + '] ' + mining[event.id].msg)
			}
			else if (energyMarkers && energy[event.id]) {
				alertMessage('Find [' + energy[event.id].name + '] ' + energy[event.id].msg)
				noticeMessage('Find [' + energy[event.id].name + '] ' + energy[event.id].msg)
			}
			else {
				return true
			}
			spawnItem(event.gameId, event.loc)
			mobid.push(event.gameId)
		}
	})
	
	mod.hook('S_DESPAWN_COLLECTION', 2, (event) => {
		if (mobid.includes(event.gameId)) {
			despawnItem(event.gameId)
			mobid.splice(mobid.indexOf(event.gameId), 1)
		}
	})
	
	function spawnItem(gameId, loc) {
		loc.z = loc.z - 100
		mod.send('S_SPAWN_DROPITEM', 6, {
			gameId: gameId*100n,
			loc: loc,
			item: 98260,
			amount: 1,
			expiry: 999999,
			owners: [{
				id: 0
			}]
		})
	}
	
	function despawnItem(gameId) {
		mod.send('S_DESPAWN_DROPITEM', 4, {
			gameId: gameId*100n
		})
	}
	
	function alertMessage(msg) {
		if (sendToAlert) {
			mod.send('S_DUNGEON_EVENT_MESSAGE', 2, {
				type: 43,
				chat: 0,
				channel: 0,
				message: msg
			})
		}
	}
	
	function noticeMessage(msg) {
		if (sendToNotice) {
			mod.send('S_CHAT', 2, {
				channel: 25,
				authorName: 'collection',
				message: msg
			})
		}
	}
	
	function gatheringStatus() {
		sendStatus(
			`Module : ${enabled ? BLU('On') : YEL('Off')}`,
			`Warning : ${sendToAlert ? BLU('Enable') : YEL('Disable')}`,
			`Notification : ${sendToNotice ? BLU('Enable') : YEL('Disable')}`,
			
			`GatherPrompt : ${plantsMarkers ? BLU('Display') : YEL('Hide')}`,
			`OrePrompt : ${miningMarkers ? BLU('Display') : YEL('Hide')}`,
			`EssencePrompt : ${energyMarkers ? BLU('Display') : YEL('Hide')}`
		)
	}
	
	function sendStatus(msg) {
		mod.command.message([...arguments].join('\n\t - '))
	}
	
	function sendMessage(msg) {
		mod.command.message(msg)
	}
	
	function BLU(bluetext) {
		return '<font color="#56B4E9">' + bluetext + '</font>'
	}
	
	function YEL(yellowtext) {
		return '<font color="#E69F00">' + yellowtext + '</font>'
	}
	
	function RED(redtext) {
		return '<font color="#FF0000">' + redtext + '</font>'
	}
	
}
