export type Item = {
	id: string
	name: string
	primarySlot: string
	slots: CompactSlot[]
	description: string
}

export type TempItem = {
	id: string
	name: string
	primarySlot: string
	slots: string
	desc: string
}

export type CompactSlot = {
	id: string
	quantity: number
}

export function TempsToItems(temp: TempItem[]): Item[] {
	// DEBUGGING
	//console.log("temp:\n")
	//console.log(temp)

	// CREATE ARRAY TO RETURN
	let parsedItems = new Array<Item>(temp.length)

	// ITERATE THROUGH EACH OBJECT IN ARRAY AND PARSE THE SLOT
	// ARRAY INTO A NEW ARRAY OF STRINGS IN PARSEDJSON
	for (let i = 0; i < temp.length; i++) {
		let parsedJSON: CompactSlot[] = JSON.parse(temp[i].slots)

		// DEBUGGING 
		//console.log("parsedJson:\n")
		//console.log(parsedJSON)

		parsedItems[i] = {
			id: temp[i].id,
			name: temp[i].name,
			primarySlot: temp[i].primarySlot,
			slots: parsedJSON,
			description: temp[i].desc
		}
	}
	return parsedItems
}

export function printItemSlots(item: Item): string {
	var result: string = ""
	for (let i = 0; i < item.slots.length; i++) {
		result += " Slot: " + item.slots[i].id + " Quantity: " + item.slots[i].quantity + "   "
	}
	return result
}