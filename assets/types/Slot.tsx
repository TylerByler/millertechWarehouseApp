export type Slot = {
	id: string,
	items: CompactItem[],
	isReady: number
}

export type TempSlot = {
	id: string,
	items: string,
	isReady: number
}

export type CompactItem = {
	item_id: string,
	quantity: number
}

export function TempsToSlots(temp: TempSlot[]): Slot[] {
	let parsedSlots = new Array<Slot>(temp.length)
	for (let i = 0; i < temp.length; i++) {
		parsedSlots[i] = {
			id: temp[i].id,
			items: JSON.parse(temp[i].items),
			isReady: temp[i].isReady
		}
	}
	return parsedSlots
}

/* export function SlotToCompact(slot: Slot): CompactSlot {
	
} */