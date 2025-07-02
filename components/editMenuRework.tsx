import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import { STATUS } from "./slotEditTileRework"

type Props = {
	slotId: number
	slots: {id: string, quantity: number, status: STATUS, isOgSlot: boolean}[]
	onCloseEditSlot: () => void,
	setSlots: (slots: {id:string, quantity:number, status: STATUS, isOgSlot: boolean}[]) => void
}

export default function EditMenu({slotId, slots, onCloseEditSlot, setSlots}: Props) {
	const [updatedSlotQuantity, setUpdatedSlotQuantity] = useState<number>(0)
	const [previousQuantity, setPreviousQuantity] = useState<number>(0)

	useEffect(() => {
		if (slots[slotId] !== undefined) 
			{setPreviousQuantity(slots[slotId].quantity)}
	},[])

	return (
		<View style={styles.modalContainer}>
			<View style={styles.editModalBox}>
				<View style={styles.exitButtonContainer}>
					<Pressable style={styles.exitButton} onPress={onCloseEditSlot}>
						<MaterialIcons name="close" color="#25292e" size={30} />
					</Pressable>
				</View>
				<View style={styles.editBoxContent}>
					<View style={styles.editSlotBox}>
						<View style={styles.slotLabel}>
							<Text style={styles.searchBarTitleText}>
								Edit Slot {slots[slotId] !== undefined ? slots[slotId].id : "N/A"}
							</Text>
						</View>
						<TextInput 
						style={styles.editSlotTextboxContainer}
						placeholder={previousQuantity.toString()}
						placeholderTextColor={"grey"}
						onChangeText={(value) => {
							setUpdatedSlotQuantity(parseInt(value))
							console.log("SLOTS DURING TEXT BOX UPDATE")
							console.log(slots)
						}}
						></TextInput>
					</View>
					<Pressable 
					style={styles.submitButton} 
					onPress={() => {
						console.log("SLOTS BEFORE ARRAY ASSIGNMENT")
						console.log(slots)

						const newSlots: Array<{id:string, quantity:number, status: STATUS, isOgSlot: boolean}> = slots;

						console.log("SLOTS AFTER ARRAY ASSIGNMENT")
						console.log(slots)

						newSlots[slotId].quantity = updatedSlotQuantity;
						console.log("SLOTS AFTER QUANTITY ASSIGNMENT")
						console.log(slots[slotId].quantity)
						console.log("NEW SLOTS AFTER QUANTITY ASSIGNMENT")
						console.log(newSlots[slotId].quantity)

						if (updatedSlotQuantity === 0) {
							newSlots[slotId].status = STATUS.DELETED
						}
						if (updatedSlotQuantity === slots[slotId].quantity) {
							newSlots[slotId].status = STATUS.NORMAL
						}
						if (updatedSlotQuantity < 0 && updatedSlotQuantity !== slots[slotId].quantity) {
							newSlots[slotId].status = STATUS.CHANGED
						}
						setSlots(newSlots);
						onCloseEditSlot();
					}}>
						<Text style={styles.submitButtonText}>Submit</Text>
					</Pressable>
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		justifyContent: "center", 
		alignItems: "center",
		backgroundColor: '#00000099',
	},
	editModalBox: {
		width: "50%",
		height: "40%",
		borderWidth: 4,
		borderColor: "#25292e",
		backgroundColor: '#fff',
		borderRadius: 16,
	},
	editBoxContent: {
		flex: 9,
		justifyContent: "center",
		alignItems: "center"
	},
	exitButtonContainer: {
		flex: 1
	},
	exitButton: {
		marginLeft: 3,
		justifyContent: "center",
		alignContent: "center",
		zIndex: 1,
		position: "absolute",
	},
	editSlotBox: {
		width: "80%",
		height: "30%",
		borderWidth: 4,
		borderColor: "#25292e",
		borderRadius: 16
	},
	submitButton: {
		width: 120,
		height: 40,
		backgroundColor:"#25292e",
		marginTop: 30,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center"
	},
	submitButtonText: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#fff"
	},
	slotLabel: {
		flex: 1,
		backgroundColor: "#25292e",
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	editSlotTextboxContainer: {
		flex: 1,
		textAlign: "center",
		textAlignVertical: "center",
		fontSize: 20,
	},
	searchBarTitleText: {
		fontSize: 30,
		fontWeight: "bold",
		color: "white"
	},
})