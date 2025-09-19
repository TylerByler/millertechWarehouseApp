import { STATUS } from "@/assets/types/STATUS"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native"

type Props = {
	slotIndex: number,
	slot: {slot_id: string, quantity: number, status: STATUS, isOgSlot: boolean},
	ogQuantity: number
	onCloseEditSlot: () => void,
	onSubmit: (slotIndex: number,updatedSlotQuantity: number) => void
}

export default function SlotEditMenu({slotIndex, slot, ogQuantity, onCloseEditSlot, onSubmit}: Props) {
	const [thisSlot, setThisSlot] = useState<{id: string, quantity: number, status: STATUS, isOgSlot: boolean}>({id: "", quantity: -1, status: STATUS.NORMAL, isOgSlot: false})
	const [updatedSlotQuantity, setUpdatedSlotQuantity] = useState<number>(0)
	const [previousQuantity, setPreviousQuantity] = useState<number>(0)

	useEffect(() => {
		if (slot !== undefined) {
				setThisSlot({id: slot.slot_id, quantity: slot.quantity, status: slot.status, isOgSlot: slot.isOgSlot})
				setPreviousQuantity(ogQuantity)
			}
	},[])

	const SubmitButton = () => (
		<Pressable 
		style={styles.submitButton} 
		onPress={() => {
			onSubmit(slotIndex, updatedSlotQuantity)
			onCloseEditSlot();
		}}>
			<Text style={styles.submitButtonText}>Submit</Text>
		</Pressable>
	)

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
								Edit Slot {thisSlot.id !== undefined ? thisSlot.id : "N/A"}
							</Text>
						</View>
						<TextInput 
						style={styles.editSlotTextboxContainer}
						placeholder={previousQuantity.toString()}
						placeholderTextColor={"grey"}
						onChangeText={(value) => {
							setUpdatedSlotQuantity(parseInt(value))
						}}
						></TextInput>
					</View>
					<SubmitButton></SubmitButton>
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