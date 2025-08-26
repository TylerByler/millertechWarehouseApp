import { Slot } from "@/assets/types/Slot";
import { STATUS } from "@/assets/types/STATUS";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import ItemEditMenu from "./itemEditMenu";

type Props = {
  slot: Slot;
  onClose: () => void;
};

export default function ItemEditTile({ slot, onClose }: Props) {
  const [editItem, setEditItem] = useState<number>(-1);
  const [isModalVisible, setIsModalVisible] = useState<boolean>();
  const [presentedData, setPresentedData] = useState<number[]>([]);
  const [importantItems, setImportantItems] = useState<number[]>([]);
  const [items, setItems] = useState<
    { id: string; quantity: number; status: STATUS; isOgItem: boolean }[]
  >([]);
  const [ogItems, setOgItems] = useState<
    { id: string; quantity: number; status: STATUS; isOgItem: boolean }[]
  >([]);

  const database = useSQLiteContext();

  const loadData = async () => {
    try {
      const itemsResult = await database.getAllAsync<{ id: string }>(
        "SELECT id FROM items ORDER BY id ASC"
      );
      const quantityResult = await database.getAllAsync<{
        slot_id: string;
        item_id: string;
        quantity: number;
      }>(
        "SELECT item_id, quantity FROM quantities WHERE slot_id = '" +
          slot.id +
          "' ORDER BY item_id ASC;"
      );
      console.log(
        "itemEditTile: itemsResult************************************************************************"
      );
      console.log(itemsResult);
      console.log("itemEditTile: quantityResult");
      console.log(quantityResult);
      const newItems = new Array<{
        id: string;
        quantity: number;
        status: STATUS;
        isOgItem: boolean;
      }>();
      const newPresentedData = new Array<number>();
      for (let i = 0; i < itemsResult.length; i++) {
        newItems.push({
          id: itemsResult[i].id,
          status: STATUS.NORMAL,
          quantity: 0,
          isOgItem: false,
        });
        for (let j = 0; j < quantityResult.length; j++) {
          console.log(
            "newItems[newItems.length -1].id = " +
              newItems[newItems.length - 1].id
          );
          console.log(
            "quantityResult[j].item_id = " + quantityResult[j].item_id
          );
          if (newItems[newItems.length - 1].id === quantityResult[j].item_id) {
            newItems[newItems.length - 1].quantity = quantityResult[j].quantity;
            newItems[newItems.length - 1].isOgItem = true;
            newPresentedData.push(newItems.length - 1);
          }
        }
      }

      setItems(newItems);
      setOgItems([...newItems]);
      setPresentedData(newPresentedData);
      setImportantItems([...newPresentedData]);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    console.log("itemEditTile: Presented Data Was Updated");
    console.log(presentedData);
  }, [presentedData]);

  useEffect(() => {
    if (editItem < 0) {
      setIsModalVisible(false);
    } else {
      setIsModalVisible(true);
    }
    console.log("itemEditTile: Edit Item Was Updated");
    console.log(editItem);
  }, [editItem]);

  const searchItems = (searchedValue: string) => {
    if (searchedValue.length === 0) {
      setPresentedData(importantItems);
      return;
    }
    const newItemList = new Array<number>();
    for (let i = 0; i < items.length; i++) {
      let isMatch = true;
      for (let j = 0; j < items[i].id.length && j < searchedValue.length; j++) {
        if (searchedValue[j].toUpperCase() !== items[i].id[j]) {
          isMatch = false;
        }
      }
      if (isMatch && !newItemList.includes(i)) {
        newItemList.push(i);
      }
    }
    setPresentedData(newItemList);
  };

  const onPressItem = (id: number) => {
    setEditItem(id);
  };

  const onCloseEditItem = () => {
    setEditItem(-1)
  }

  const onReset = (index: number) => {
    onSubmitItemEdit(index, ogItems[index].quantity);
  };

  const onSubmitItemEdit = (itemIndex: number, updatedItemQuantity: number) => {
    // YET TO BE IMPLEMENTED
    // will make an update to a position in the items array
    let newItem: {
      id: string;
      quantity: number;
      status: STATUS;
      isOgItem: boolean;
    };
    const newItemId = items.findIndex((e) => e.id === items[itemIndex].id);
    const previousQuantity = ogItems[newItemId].quantity;

    newItem = {
      id: items[itemIndex].id,
      quantity: updatedItemQuantity,
      status: STATUS.CHANGED,
      isOgItem: items[itemIndex].isOgItem,
    };

    if (updatedItemQuantity <= 0) {
      newItem = {
        id: items[itemIndex].id,
        quantity: 0,
        status: STATUS.DELETED,
        isOgItem: items[itemIndex].isOgItem,
      };
    }
    if (updatedItemQuantity === previousQuantity) {
      newItem = {
        id: items[itemIndex].id,
        quantity: updatedItemQuantity,
        status: STATUS.NORMAL,
        isOgItem: items[itemIndex].isOgItem,
      };
    }
    const indexOfItem = items.findIndex((e) => e.id === newItem.id);

    if (!newItem.isOgItem) {
      if (newItem.status !== STATUS.NORMAL) {
        importantItems.push(indexOfItem);
        importantItems.sort();
      } else {
        const valueIndex = importantItems.findIndex((e) => e === indexOfItem);
        const tmpA = importantItems[valueIndex];
        const tmpB = importantItems[importantItems.length - 1];

        importantItems[valueIndex] = tmpB;
        importantItems[importantItems.length - 1] = tmpA;

        importantItems.pop();
      }
    }

    items[items.findIndex((e) => e.id === newItem.id)] = newItem;
    setPresentedData([...importantItems]);
  };

  const onSubmitDataToDB = async () => {
    const finalItems = items.filter((e) => e.quantity !== 0 || e.isOgItem);

    const result = await database.getAllAsync<{
      slot_id: string;
      item_id: string;
      quantity: number;
    }>("SELECT * FROM quantities WHERE slot_id = '" + slot.id + "';");

    let removeStatement = "";

    try {
      for (let i = 0; i < finalItems.length; i++) {
        if (finalItems[i].quantity === 0) {
          if (removeStatement !== "") {
            removeStatement += ", ";
          }
          removeStatement += "'" + finalItems[i].id + "'";
        }
        if (finalItems[i].quantity !== 0) {
          let resultIndex = result.findIndex((e) => {
            console.log("E.itemId = " + e.item_id);
            console.log("FinalItems[i].id" + finalItems[i].id);
            return e.item_id == finalItems[i].id;
          });
          console.log("Result Index");
          console.log(resultIndex);
          if (
            resultIndex !== -1 &&
            result[resultIndex].quantity !== finalItems[i].quantity
          ) {
            await database.runAsync(
              "UPDATE quantities SET quantity = " +
                finalItems[i].quantity +
                " WHERE item_id = '" +
                finalItems[i].id +
                "' AND slot_id = '" +
                slot.id +
                "';"
            );
          }
          if (resultIndex == -1) {
            await database.runAsync(
              "INSERT INTO quantities (item_id, slot_id, quantity) VALUES ('" +
                finalItems[i].id +
                "', '" +
                slot.id +
                "', " +
                finalItems[i].quantity.toString() +
                ");"
            );
          }
        }
      }
    } catch (e) {
      console.log(e);
    }

    try {
      await database.runAsync(
        "DELETE FROM quantities WHERE slot_id = '" +
          slot.id +
          "' AND item_id IN (" +
          removeStatement +
          ");"
      );
    } catch (e) {
      console.log(e);
    }

    try {
      for (let i = 0; i < finalItems.length; i++) {}
    } catch (e) {
      console.log(e);
    }

    onClose();
  };

  const Items = ({ item }: { item: number }) => (
    <Pressable
      style={[
        styles.listItem,
        items[item].status === STATUS.NORMAL &&
          !items[item].isOgItem && { backgroundColor: "#cfd7e1" },
        items[item].status === STATUS.NORMAL &&
          items[item].isOgItem && { backgroundColor: "#8fffa9" },
        items[item].status === STATUS.CHANGED && { backgroundColor: "#ffebaf" },
        items[item].status === STATUS.DELETED && { backgroundColor: "#ffc4c4" },
      ]}
      onPress={() => onPressItem(item)}
    >
      <View style={styles.listLabel}>
        <Text>{items[item].id}</Text>
      </View>
      <View style={styles.listLabel}>
        <Text>{items[item].quantity}</Text>
      </View>
      <View style={styles.listLabel}>
        <Pressable style={styles.resetButton} onPress={() => onReset(item)}>
          <Text>Reset</Text>
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBarTitle}>
          <View style={styles.searchBarTitleTextContainer}>
            <Text style={styles.searchBarTitleText}>
              Editing Items of Slot #{slot.id}
            </Text>
          </View>
        </View>
        <TextInput
          style={styles.searchBar}
          placeholder="Enter Item ID..."
          placeholderTextColor={"grey"}
          onChangeText={(value) => {
            searchItems(value);
          }}
        />
      </View>
      <View style={styles.listContainer}>
        <View style={styles.listLabelContainer}>
          <View style={styles.listLabel}>
            <Text style={styles.listLabelText}>Item</Text>
          </View>
          <View style={styles.listLabel}>
            <Text style={styles.listLabelText}>Quantity</Text>
          </View>
          <View style={styles.listLabel}>
            <Text style={styles.listLabelText}>Reset Button</Text>
          </View>
        </View>
        <FlatList
          data={presentedData}
          renderItem={Items}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
      <View
        style={{
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Pressable
          style={styles.submitButton}
          onPress={() => onSubmitDataToDB()}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>
            Submit
          </Text>
        </Pressable>
      </View>
      <Modal animationType="none" transparent={true} visible={isModalVisible}>
        <ItemEditMenu
          isModalVisible={isModalVisible}
          itemIndex={editItem}
          item={items[editItem]}
          ogQuantity={
            ogItems[editItem] !== undefined ? ogItems[editItem].quantity : 0
          }
          onCloseEditItem={onCloseEditItem}
          onSubmit={onSubmitItemEdit}
        ></ItemEditMenu>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "80%",
    marginTop: 80,
    flexDirection: "column",
    alignContent: "center",
    flex: 1,
  },
  searchBarContainer: {
    width: "100%",
    height: 120,
    flexDirection: "column",
    marginBottom: 40,
  },
  searchBarTitle: {
    flex: 1,
    borderWidth: 4,
    borderColor: "#25292e",
    backgroundColor: "#25292e",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  searchBar: {
    flex: 1,
    borderWidth: 4,
    borderTopWidth: 0,
    borderColor: "#25292e",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 10,
  },
  searchBarTitleTextContainer: {
    alignSelf: "center",
    height: "100%",
    justifyContent: "center",
  },
  searchBarTitleText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
  },
  listContainer: {
    flex: 1,
    width: "80%",
    alignContent: "center",
    alignSelf: "center",
  },
  listItem: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "#25292e",
    height: 55,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resetButton: {
    height: 35,
    width: 60,
    borderWidth: 2,
    borderColor: "#25292e",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  listLabelContainer: {
    flexDirection: "row",
    height: 60,
    backgroundColor: "#25292e",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  listLabel: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listLabelText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  submitButton: {
    width: 200,
    height: 80,
    backgroundColor: "#25292e",
    marginTop: 30,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
