
var attacksQueue = [];
var newAttacksQueue = [];
var status = "WAITING"; //WAITING, PLACING_UNITS, CONFIRMING_ATTACK
var refreshID = setInterval(tick, 500);

restore_variables();

console.log("Attacks Queue");
console.log(attacksQueue);

function tick(){
	chrome.storage.sync.get({
		attacksQueue: [],
		newAttacksQueue: []
	}, function(items) {
		attacksQueue = items.attacksQueue;
		newAttacksQueue = items.newAttacksQueue;
	});

	if (status == "WAITING"){
		if (attacksQueue.length > 0){
			status = "PLACING_UNITS";
			chrome.storage.sync.set({
				status: status
			}, function() {
				console.log("State [Placing Units]");
			});
			location = "game.php?screen=place";
		}
		else if(newAttacksQueue.length > 0)
		{
			attacksQueue = newAttacksQueue;
			newAttacksQueue = [];
			status = "PLACING_UNITS";
			chrome.storage.sync.set({
				attacksQueue: attacksQueue,
				newAttacksQueue: [],
				status: status
			}, function() {
				console.log("State [Placing Units]");
			});
			location = "game.php?screen=place";
			continueAttack();
	    }
	}
}

function restore_variables() {
	chrome.storage.sync.get({
		attacksQueue: [],
		newAttacksQueue: [],
		status : "WAITING"
	}, function(items) {
		attacksQueue = items.attacksQueue;
		newAttacksQueue = items.newAttacksQueue;
		status = items.status;
		console.log(attacksQueue);
		continueAttack();
	});
}

function continueAttack(){
	if(status=="PLACING_UNITS"){
		if(attacksQueue.length > 0){
			status = "CONFIRMING_ATTACK";
			chrome.storage.sync.set({
				status: status
			}, function() {
				console.log("State [Confirming Attack]");
			});
			placeAttack();
		} else {
			console.log(attacksQueue);
			status = "WAITING";
			chrome.storage.sync.set({
				status: status
			}, function() {
				console.log("State [Waiting 1]");
			});
		}
	}else if(status=="CONFIRMING_ATTACK"){
		status = "WAITING";
		chrome.storage.sync.set({
			status: status
		}, function() {
			console.log("State [Waiting 2]");
		});
		confirmAttack();
	}

}

//message handler
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	if(request.type == 'getCurrentVillage'){
		var coords = $("tr#menu_row2 b").text();
		sendResponse({
			name: $("tr#menu_row2 a").text(),
			coords: [coords.substr(1, 3), coords.substr(5, 3)]
		});
	}else {
		var newAttack = request.greeting;
		attacksQueue.push(newAttack);
	}
	console.log(request);
});

function placeAttack(){
	var currentAttack = attacksQueue.shift();
	newAttacksQueue.push(currentAttack)
	chrome.storage.sync.set({
		attacksQueue: attacksQueue,
		newAttacksQueue: newAttacksQueue
	}, function() {
		console.log("Placing attack");
		console.log(attacksQueue);
	});
	placeCoordsToAttack(currentAttack[0][0],currentAttack[0][1]);
	placeUnitsToAttack(currentAttack[1]);
	$("input#target_attack").click();
}

function confirmAttack(){
	console.log("Clicking on confirm button");
	$("input#troop_confirm_go").click();
}


function placeCoordsToAttack(coord1,coord2){
	$("input.target-input-field").val(coord1 + "|" + coord2);
}

function placeUnitsToAttack(units){
	$("input#unit_input_spear").val(units[0]);
	$("input#unit_input_sword").val(units[1]);
	$("input#unit_input_axe").val(units[2]);
	$("input#unit_input_archer").val(units[3]);
	$("input#unit_input_spy").val(units[4]);
	$("input#unit_input_light").val(units[5]);
	$("input#unit_input_marcher").val(units[6]);
	$("input#unit_input_heavy").val(units[7]);
	$("input#unit_input_ram").val(units[8]);
	$("input#unit_input_catapult").val(units[9]);
	$("input#unit_input_knight").val(units[10]);
}

