import { createNewChat } from "../../AxiosCalls/UserServices/userServices";

const IntiateChat = async (props) => {

    const dataset = {
        chat_category: props.chat_category,
        chat_related_id: props.chat_related_id,
        chat_avatar: props.chat_avatar,
        supplier_id: props.supplier_id,
        chat_name: props.chat_name,
        customer_collection_id: props.customer_collection_id,
        customer_name: props.customer_name,
        customer_mail_id: props.customer_mail_id,
        customer_id: props.customer_id,
        chat_related_to: "Product",
        supplier_mail_id: "aahaas@gmail.com",
        supplier_name: '',
        status: "pending",
        group_chat: '',
        chat_created_date: "",
        supplier_added_date: Date.now(),
        comments: '',
    }

    let result = [];
    await createNewChat(dataset).then((response) => {
        result = response
    })
    return result;

}

export { IntiateChat };
