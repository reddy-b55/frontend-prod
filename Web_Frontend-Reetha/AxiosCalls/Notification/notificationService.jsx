import axios from "axios"
 
 
const getAllInAppNotifications = async (id) => {
    let notificationData = [];
 
    console.log(`getNotificationsByUser/${id}`,"NOTIIIIIIIIIIII")
 
    await axios.get(`getNotificationsByUser/${id}`).then(response => {
        if (response?.data?.status == 200) {
            notificationData = [response?.data?.notifications,response?.data?.pendingCount]
        }
    }).catch(res => {
        notificationData = []
    })
 
    return notificationData
}
 
export { getAllInAppNotifications }