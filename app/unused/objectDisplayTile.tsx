/* import { Item } from "@/assets/types/Item";
import { Slot } from "@/assets/types/Slot";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
	id: string
	onEdit: () => {}
}


export default function ObjectDisplayTile({object}: {object: Item | Slot}, {id, onEdit}: Props) {
	<View style={styles.itemContainer}>
		<View style={styles.titleContainer}>
			<Text style={styles.title}>
				Item #{id}
			</Text>
		</View>
		<View style={styles.detailContainer}>
			<View style={styles.slotLinksContainer}>
				<View style={[styles.slotLinksLabel, {backgroundColor: "#3b434d", height: 40}]}>
					<Text style={{fontWeight: "bold", fontSize: 20, color: "white"}}>SLOTS</Text>
				</View>
				<View style={styles.slotLinksLabel}>
					<View style={{flex: 1, alignItems: "center"}}>
						<Text style={{fontWeight: "bold"}}>ID</Text>
						</View>
					<View style={{flex: 1, alignItems: "center"}}>
						<Text style={{fontWeight: "bold"}}>QUANTITY</Text>
					</View>
				</View>
				{object instanceof Item}
				<FlatList 
				data={object.slots}
				renderItem={SlotLinks}
				/>
				<Pressable style={[styles.slotLinksLabel, {alignSelf: "flex-end"}]} onPress={onEdit}>
					<Text>Edit Slots</Text>
				</Pressable>
			</View>
		</View>
	</View>
}

const styles = StyleSheet.create({
	title: {
		fontSize: 40,
		fontWeight: "bold",
		color: "white"
	},
	titleContainer: {
		backgroundColor: "#25292e",
		flex: 1,
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		justifyContent: "center",
		alignItems: "center"
	},
	detailContainer: {
		flex: 6,
		borderWidth: 4,
		borderColor: "#25292e",
		borderBottomLeftRadius: 16,
		borderBottomRightRadius: 16,
	},
	itemContainer: {
		height: 500,
	},
	slotLinksContainer: {
		flex: 1,
		alignSelf: "flex-start",
		width: "30%",
		borderRightWidth: 4,
		borderColor: "#25292e"
	},
	slotLinksLabel: {
		width: "100%",
		height: 30,
		backgroundColor: "#6c7a8b",
		borderBottomWidth: 2.5,
		borderColor: "#25292e",
		justifyContent: "center",
		flexDirection: "row",
		alignItems: "center",
	}
}) */