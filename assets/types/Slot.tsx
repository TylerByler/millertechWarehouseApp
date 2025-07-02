
export type Slot = {
	xPos: number
	yPos: number
	zPos: number
	id: string
	items: string[]
}

export type TempSlot = {
	xPos: number
	yPos: number
	zPos: number
	id: string
	items: string
}

export function TempsToSlots(temp: TempSlot[]): Slot[] {
	let parsedSlots = new Array<Slot>(temp.length)
	for (let i = 0; i < temp.length; i++) {
		parsedSlots[i] = {
			id: temp[i].id,
			items: JSON.parse(temp[i].items),
			xPos: temp[i].xPos,
			yPos: temp[i].yPos,
			zPos: temp[i].zPos
		}
	}
	return parsedSlots
}

/* export function SlotToCompact(slot: Slot): CompactSlot {
	
} */