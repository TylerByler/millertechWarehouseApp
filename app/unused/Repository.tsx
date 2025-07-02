/* import { Api } from "./Api";
import { Item } from "./Item";
import { Slot } from "./Slot"; */

/* interface Repository {
	slots: Slot[]
	items: Item[]
	(search: string): Slot[]
	(search: string): Item[]
} */

/* 	class Repository {
	slots: Slot[]
	items: Item[]
	private api: Api

	constructor(newApi: Api) {
		this.api = newApi

		this.slots = this.api.getSlotList()
		this.items = this.api.getItemList()
	}

	getItem(searchedItem: string): Item {
		return this.api.getItem(searchedItem)
	}

	getSlot(searchedItem: string): Slot {
		return this.api.getSlot(searchedItem)
	}

	searchForItems(searchTerm: string): Item[] {
		return this.api.searchForItem(searchTerm)
	}

	searchForSlots(searchTerm: string): Slot[] {
		const result = this.api.searchForSlot(searchTerm)
		console.log(result)
		return []
	}
}

export default Repository */