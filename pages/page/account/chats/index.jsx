// import Link from "next/link";
// import { Media, Spinner } from "reactstrap";
// import { useRouter } from "next/router";
// import React, { useContext, useEffect, useRef, useState } from "react";
// import {
//   addDoc,
//   collection,
//   doc,
//   getDoc,
//   onSnapshot,
//   orderBy,
//   query,
//   updateDoc,
// } from "firebase/firestore";

// import { db } from "../../../../firebase";
// import { AppContext } from "../../../_app";

// import defaultimage from "/public/assets/images/NavbarImages/defaultImage.png";
// import aahaasLogo from "../../../../public/assets/images/icon/favicon.png";

// import CommonLayout from "../../../../components/shop/common-layout";
// import ModalBase from "../../../../components/common/Modals/ModalBase";
// import ToastMessage from "../../../../components/Notification/ToastMessage";

// import SearchIcon from "@mui/icons-material/Search";
// import CloseIcon from "@mui/icons-material/Close";
// import SendIcon from "@mui/icons-material/Send";
// import AddIcon from "@mui/icons-material/Add";

// import AppleIcon from "@mui/icons-material/Apple";
// import ShopIcon from "@mui/icons-material/Shop";
// import { LazyLoadImage } from "react-lazy-load-image-component";
// import GetProfileImage from "../../../../AxiosCalls/GetProfileImage";
// import { Skeleton } from "@mui/material";

// function Chats() {
//   const router = useRouter();
//   const messageContailerRef = useRef(null);

//   const { userStatus, baseUserId } = useContext(AppContext);

//   const [chatListsLoad, setChatListsLoad] = useState(true);
//   const [chatLists, setChatLists] = useState([]);
//   const [filteredChatLists, setFilteredChatLists] = useState([]);

//   const [messages, setMessages] = useState([]);
//   const [noMessages, setNoMessages] = useState(false);
//   const [loadingChats, setLoadingChats] = useState(true);

//   const [openChatDetails, setOpenChatDetails] = useState({
//     status: false,
//     chatId: "",
//     chatDetails: "",
//   });

//   const handleOpenChats = async (value) => {
//     router.replace({
//       pathname: "/page/account/chats",
//       query: value.id,
//     });
//     setOpenChatDetails({
//       status: true,
//       chatId: value.id,
//       chatDetails: value,
//     });
//     console.log("value hotel image", value);
//     const chatDocRef = doc(db, "customer-chat-lists/", value.id);
//     const chatDocSnap = await getDoc(chatDocRef);
//     if (chatDocSnap.exists()) {
//       const updateData = {
//         customer_unreads: 0,
//       };
//       await updateDoc(chatDocRef, updateData);
//     }
//   };

//   const handleCloseChats = () => {
//     setOpenChatDetails({
//       status: false,
//       chatId: "",
//       chatDetails: "",
//     });
//     router.replace({ pathname: "/page/account/chats" });
//   };

//   const groupMessagesByDate = (messages) => {
//     return messages.reduce((acc, message) => {
//       const date = formatDate(message.createdAt);
//       if (!acc[date]) {
//         acc[date] = [];
//       }
//       acc[date].push(message);
//       return acc;
//     }, {});
//   };

//   const getChatMessages = async () => {
//     const q = query(
//       collection(db, "chat-updated/chats/" + openChatDetails.chatId),
//       orderBy("createdAt", "desc")
//     );
//     const getmessages = onSnapshot(q, (QuerySnapshot) => {
//       const fetchedMessages = [];
//       QuerySnapshot.forEach((doc) => {
//         fetchedMessages.push({ ...doc.data(), id: doc.id });
//       });
//       const sortedMessages = fetchedMessages.toSorted(
//         (a, b) => a.createdAt - b.createdAt
//       );
//       if (sortedMessages.length === 0) {
//         setNoMessages(true);
//         setMessages({});
//       } else {
//         let result = groupMessagesByDate(sortedMessages);
//         setMessages(result);
//       }
//     });
//     return () => getmessages();
//   };

//   const fetchUserChats = async () => {
//     const q = query(
//       collection(db, "customer-chat-lists"),
//       orderBy("updatedAt", "desc")
//     );
//     const getmessages = onSnapshot(q, (QuerySnapshot) => {
//       const fetchedMessages = [];
//       QuerySnapshot.forEach((doc) => {
//         fetchedMessages.push({ ...doc.data(), id: doc.id });
//       });
//       let chatlist = fetchedMessages.filter((value) => {
//         return Number(value.customer_id) === Number(baseUserId.cxid);
//       });
//       setChatListsLoad(false);
//       setChatLists(chatlist);
//       setFilteredChatLists(chatlist);
//       setLoadingChats(false); // Set loadingChats to false once data is loaded
//     });
//     return () => getmessages();
//   };

//   const getDateAndtime = (value) => {
//     const totalSeconds = value.seconds + value.nanoseconds / 1e9;
//     const dateTime = new Date(totalSeconds * 1000);

//     const currentDate = new Date();
//     const formattedTime = dateTime.toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     });

//     let formattedDateTime;

//     const isSameDay = dateTime.toDateString() === currentDate.toDateString();
//     const isYesterday =
//       new Date(
//         currentDate.setDate(currentDate.getDate() - 1)
//       ).toDateString() === dateTime.toDateString();

//     if (isSameDay) {
//       formattedDateTime = `Today, ${formattedTime}`;
//     } else if (isYesterday) {
//       formattedDateTime = `Yesterday, ${formattedTime}`;
//     } else {
//       formattedDateTime = dateTime.toLocaleString();
//     }

//     return formattedDateTime;
//   };

//   const formatDate = (timestamp) => {
//     const date = new Date(timestamp.seconds * 1000);
//     return date.toISOString().split("T")[0];
//   };

//   const [userMessage, setUserMessage] = useState("");

//   const handleSendMessage = async () => {
//     if (userMessage.trim() === "") {
//          ToastMessage({
//         status: "warning",
//         message: "Please enter a message",})
//     }else{
//        setUserMessage("");
//       await addDoc(
//         collection(db, "chat-updated/chats/" + openChatDetails.chatId),
//         {
//           text: userMessage,
//           name: baseUserId.user_username,
//           avatar: baseUserId.pro_pic,
//           createdAt: new Date(),
//           role: "Customer",
//           uid: baseUserId.cxid,
//         }
//       );
//       await getChatMessages();
//       await handleUpdateMessage(openChatDetails.chatId);
//     }

//   };

//   const handleUserMessage = (value) => {
//     setUserMessage(value);
//   };

//   const handleKeyUp = (event) => {
//     if (event.key === "Enter") {
//       handleSendMessage();
//     }
//   };

//   const handleUpdateMessage = async (chatID) => {
//     const chatDocRef = doc(db, "customer-chat-lists/", chatID);
//     const chatDocSnap = await getDoc(chatDocRef);
//     if (chatDocSnap.exists()) {
//       const updateData = {
//         notifyAdmin: true,
//         notifySupplier: true,
//         updatedAt: new Date(),
//       };
//       await updateDoc(chatDocRef, updateData);
//     }
//   };

//   const [openNewChatPopup, setOpenNewChatPopup] = useState(false);

//   // const handleCreateChat = async (chatType) => {
//   //   setOpenNewChatPopup(false);
//   //   await addDoc(collection(db, "customer-chat-lists"), {
//   //     status: "Pending",
//   //     createdAt: new Date(),
//   //     supplierAdded: false,
//   //     notifyAdmin: true,
//   //     notifySupplier: true,
//   //     notifyCustomer: false,
//   //     customer_collection_id: baseUserId.cxid,
//   //     supplier_id: "",
//   //     supplier_name: "",
//   //     group_chat: false,
//   //     customer_name: baseUserId.user_username,
//   //     customer_mail_id: baseUserId.user_email,
//   //     supplier_mail_id: "",
//   //     supplier_added_date: "",
//   //     comments: "Technical support - chat has been created from chat page",
//   //     chat_name: `Aahaas Conversation ${chatType}`,
//   //     customer_id: baseUserId.cxid,
//   //     chat_related: "Technical-support",
//   //     chat_avatar: "",
//   //     updatedAt: new Date(),
//   //   });
//   //   await fetchUserChats();
//   // };

//   const handleCreateChat = async (chatType) => {
//   setOpenNewChatPopup(false);

//   try {
//     // Create the new chat document
//     const docRef = await addDoc(collection(db, "customer-chat-lists"), {
//       status: "Pending",
//       createdAt: new Date(),
//       supplierAdded: false,
//       notifyAdmin: true,
//       notifySupplier: true,
//       notifyCustomer: false,
//       customer_collection_id: baseUserId.cxid,
//       supplier_id: "",
//       supplier_name: "",
//       group_chat: false,
//       customer_name: baseUserId.user_username,
//       customer_mail_id: baseUserId.user_email,
//       supplier_mail_id: "",
//       supplier_added_date: "",
//       comments: "Technical support - chat has been created from chat page",
//       chat_name: `Aahaas Conversation ${chatType}`,
//       customer_id: baseUserId.cxid,
//       chat_related: "Technical-support",
//       chat_avatar: "",
//       updatedAt: new Date(),
//       customer_unreads: 0, // Add this field to prevent undefined issues
//     });

//     // Refresh the chat list
//     await fetchUserChats();

//     // Create chat details object for the newly created chat
//     const newChatDetails = {
//       id: docRef.id,
//       status: "Pending",
//       createdAt: new Date(),
//       supplierAdded: false,
//       notifyAdmin: true,
//       notifySupplier: true,
//       notifyCustomer: false,
//       customer_collection_id: baseUserId.cxid,
//       supplier_id: "",
//       supplier_name: "",
//       group_chat: false,
//       customer_name: baseUserId.user_username,
//       customer_mail_id: baseUserId.user_email,
//       supplier_mail_id: "",
//       supplier_added_date: "",
//       comments: "Technical support - chat has been created from chat page",
//       chat_name: `Aahaas Conversation ${chatType}`,
//       customer_id: baseUserId.cxid,
//       chat_related: "Technical-support",
//       chat_avatar: "",
//       updatedAt: new Date(),
//       customer_unreads: 0,
//     };

//     // Automatically open the newly created chat
//     handleOpenChats(newChatDetails);

//   } catch (error) {
//     console.error("Error creating chat:", error);
//     ToastMessage({
//       status: "error",
//       message: "Failed to create chat. Please try again.",
//     });
//   }
// };

//   const createNewChat = async () => {
//     if (userStatus.userLoggesIn) {
//       setOpenNewChatPopup(true);
//     } else {
//       router.push("/page/account/login-auth");
//       localStorage.setItem("lastPath", router.asPath);
//       ToastMessage({
//         status: "error",
//         message:
//           "You are logged in as a guest user. Please login to access the full system features",
//       });
//     }
//   };

//   const [userSearchChat, setUserSearchChat] = useState("");

//   const handleChatSearch = (value) => {
//     setUserSearchChat(value);
//     let filtered = chatLists.filter((chatData) => {
//       return chatData.chat_name
//         .toLowerCase()
//         .trim()
//         .replace(/ /g, "")
//         .includes(value);
//     });
//     setFilteredChatLists(filtered);
//   };

//   const handlleRedirectAppStore = () => {
//     window.open(`https://apps.apple.com/lk/app/aahaas/id6450589764`, "_blank");
//   };

//   const handleRedirectPlayStore = () => {
//     window.open(
//       `https://play.google.com/store/apps/details?id=com.aahaastech.aahaas&pcampaignid=web_share`,
//       "_blank"
//     );
//   };

//   useEffect(() => {
//     if (messageContailerRef.current) {
//       messageContailerRef.current.scrollTop =
//         messageContailerRef.current.scrollHeight;
//     }
//   }, [messages]);

//   useEffect(() => {
//     if (openChatDetails.status) {
//       setMessages([]);
//       getChatMessages();
//     }
//   }, [openChatDetails]);

//   useEffect(() => {
//     fetchUserChats();
//   }, []);

//   useEffect(() => {
//     if (router.query.oID && !chatListsLoad) {
//       let value = chatLists.filter((value) => {
//         return value.id == router.query.oID;
//       });
//       setOpenChatDetails({
//         status: true,
//         chatId: value[0].id,
//         chatDetails: value[0],
//       });
//     }
//   }, [router.query.oID, chatListsLoad]);

//   return (
//     <CommonLayout
//       title="chats"
//       parent="home"
//       showMenuIcon={false}
//       showSearchIcon={true}
//       showBreadcrubs={false}
//     >
//       {!userStatus.userLoggesIn ? (
//         <div className="d-flex flex-column align-items-center justify-content-center p-5 my-5">
//           <h2>Oops! something went wrong..</h2>
//           <h5>
//             To continue, please log in to your account. This helps us provide a
//             personalized experience and keep your information secure.
//           </h5>
//           <Link
//             href="/page/account/login-auth/"
//             className="btn btn-solid btn-sm mt-4"
//           >
//             Login / Register
//           </Link>
//         </div>
//       ) : loadingChats ? (
//         <div className="d-flex justify-content-center align-items-center min-vh-100">
//           <div
//             className="loader-wrapper"
//             style={{
//               position: "relative",
//               height: "auto",
//               width: "auto",
//               marginTop: "50px",
//             }}
//           >
//             <div className="loader"></div>
//           </div>
//           {/* <Spinner animation="border" role="status">
//                                     <span className="visually-hidden">Loading chats...</span>
//                                 </Spinner> */}
//           {/* <Skeleton variant="rounded" width={'100%'} height={'60%'} style={{ marginBottom: 10 }} /> */}
//         </div>
//       ) : chatLists.length === 0 ? (
//         <section className="row container pe-3 ps-1 py-3 col-12 mx-auto my-5 m-0 position-relative justify-content-center">
//           <div className="col-8 my-5 d-flex flex-column align-items-center">
//             <h3>Oops! There are not chats..</h3>
//             <p>
//               Please start a new chat to continue. This helps us provide more
//               personalized assistance for your questions.
//             </p>
//             <button
//               className="btn btn-solid py-1 px-3 rounded-1"
//               style={{ fontSize: 10 }}
//               onClick={createNewChat}
//             >
//               Create a new chat
//             </button>
//           </div>
//         </section>
//       ) : (
//         <section className="row container border pe-3 ps-1 rounded-3 py-3 col-12 mx-auto my-5 m-0 position-relative">
//           <div className="new-chatLists d-flex align-items-start flex-column col-3 row-gap-2">
//             <div className="chat-moreTools">
//               <div className="chat-searchInput">
//                 <SearchIcon className="chat-searchInput-icon" />
//                 <input
//                   placeholder="Search chats.."
//                   value={userSearchChat}
//                   onChange={(e) => {
//                     handleChatSearch(e.target.value);
//                   }}
//                 />
//                 <AddIcon
//                   className="chat-searchInput-icon"
//                   onClick={createNewChat}
//                 />
//               </div>
//             </div>
//             {filteredChatLists.map((value, key) => (
//               <div
//                 key={key}
//                 className={`w-100 p-3 rounded-3 chatLists-container-${
//                   value.id === openChatDetails.chatId ? "active" : "nonActive"
//                 }`}
//                 onClick={() => handleOpenChats(value)}
//               >
//                 <div className="d-flex align-items-center gap-2 position-relative">
//                   {/* <Media src={value.chat_avatar == "" ? aahaasLogo?.src : value?.chat_avatar?.split(',')[0]} className='chat-avatar' /> */}
//                   <Media
//                     src={
//                       !value.chat_avatar ||
//                       typeof value.chat_avatar !== "string"
//                         ? aahaasLogo?.src
//                         : value.chat_avatar.split(",")[0]
//                     }
//                     className="chat-avatar"
//                   />
//                   <div className="d-flex flex-column align-items-start">
//                     <h6 className="m-0 p-0 ellipsis-1-lines">
//                       {value.chat_name}
//                     </h6>
//                     <p className="m-0 p-0 ellipsis-1-lines">
//                       {value?.last_message?.value
//                         ? value?.last_message?.value
//                         : "Start a conversation"}
//                     </p>
//                   </div>
//                   {Number(value.customer_unreads) > 0 && (
//                     <span className="customer_unreads">
//                       {Number(value.customer_unreads) <= 9
//                         ? value.customer_unreads
//                         : "9+"}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="col-9 m-0 p-0">
//             {openChatDetails.status ? (
//               <div className={`m-0 p-0 chat-content-show`}>
//                 <div className="chat-content-head d-flex align-items-center gap-2">
//                   <Media
//                     className="border"
//                     src={
//                       openChatDetails.chatDetails.chat_avatar
//                         ? openChatDetails.chatDetails.chat_avatar.split(",")[0]
//                         : aahaasLogo.src
//                     }
//                     style={{
//                       width: "40px",
//                       height: "40px",
//                       borderRadius: "50%",
//                       objectFit: "cover",
//                       padding: "6px",
//                       backgroundColor: "white",
//                     }}
//                   />
//                   <div className="d-flex flex-column align-items-start m-0 p-0">
//                     <h6
//                       className="m-0 ellipsis-1-lines"
//                       title={openChatDetails.chatDetails.chat_name}
//                     >
//                       {openChatDetails.chatDetails.chat_name}
//                     </h6>
//                     <p
//                       className="m-0 ellipsis-1-lines"
//                       style={{
//                         color: "white",
//                         fontSize: "12px",
//                         letterSpacing: "1px",
//                       }}
//                     >
//                       {getDateAndtime(openChatDetails.chatDetails.updatedAt)}
//                     </p>
//                   </div>
//                   <CloseIcon
//                     className="ms-auto border my-auto rounded-3"
//                     sx={{ fontSize: 25 }}
//                     onClick={() => handleCloseChats()}
//                   />
//                 </div>

//                 <div className="messageContailerRef" ref={messageContailerRef}>
//                   {Object.keys(messages).map((date) => (
//                     <div key={date} className="d-flex flex-column">
//                       <span
//                         className="col my-3"
//                         style={{ textAlign: "center" }}
//                       >
//                         {date}
//                       </span>
//                       {messages[date].map((value, key) => (
//                         <div
//                           key={key}
//                           className={
//                             value.uid == baseUserId.cxid
//                               ? "mb-3 gap-2 d-flex chat-right justify-content-start flex-row-reverse align-items-start ms-auto"
//                               : "mb-3 gap-2 d-flex chat-left justify-content-start me-auto align-items-start"
//                           }
//                         >
//                           {value.uid == baseUserId.cxid ? (
//                             <GetProfileImage data={baseUserId.pro_pic} />
//                           ) : (
//                             <Media
//                               alt="chat user profile"
//                               src={aahaasLogo.src}
//                               style={{
//                                 minHeight: "30px",
//                                 maxHeight: "30px",
//                                 minWidth: "30px",
//                                 maxWidth: "30px",
//                                 borderRadius: "50%",
//                               }}
//                               className={`${
//                                 value.userId == baseUserId.cxid ? "" : ""
//                               }`}
//                             />
//                           )}
//                           <div
//                             className={`d-flex flex-column gap-0 ${
//                               value.uid == baseUserId.cxid
//                                 ? "align-items-end text-end"
//                                 : "align-items-start text-start"
//                             }`}
//                           >
//                             <p
//                               className="m-0 p-0"
//                               style={{
//                                 lineHeight: "20px",
//                                 textAlign:
//                                   value.uid == baseUserId.cxid ? "" : "",
//                                 fontSize: 14,
//                               }}
//                             >
//                               {value.text}
//                             </p>
//                             <span
//                               style={{
//                                 fontSize: 10,
//                                 textAlign:
//                                   value.uid == baseUserId.cxid ? "" : "",
//                               }}
//                             >
//                               {getDateAndtime(value.createdAt)}
//                             </span>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ))}
//                 </div>

//                 <div className="d-flex align-items-center gap-2 mb-3 chat-send-container">
//                   <input
//                     type="text"
//                     className="form-control"
//                     placeholder="Enter your message.."
//                     style={{ fontSize: 12, padding: "9px 16px" }}
//                     value={userMessage}
//                     onChange={(e) => handleUserMessage(e.target.value)}
//                     onKeyUp={handleKeyUp}
//                   />
//                   <button className="btn" onClick={handleSendMessage}>
//                     <SendIcon sx={{ fontSize: 16, marginBottom: "4px" }} />
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="m-0 p-0 chat-content-show d-flex align-items-center justify-content-center">
//                 <div className="col-8 my-5 d-flex flex-column align-items-center">
//                   <h3>Download our mobile application</h3>
//                   <p className="text-center" style={{ lineHeight: "20px" }}>
//                     Enjoy the full Aahaas experience wherever you are. Our app
//                     offers advanced security features and is optimized for fast,
//                     reliable transactions. Please download the app to proceed
//                     with your purchase.
//                   </p>
//                   <div className="d-flex align-items-center gap-3">
//                     <button
//                       className="btn btn-solid py-1 px-3 d-flex align-items-center gap-1 rounded-1"
//                       style={{ fontSize: 10, cursor: "pointer" }}
//                       onClick={handlleRedirectAppStore}
//                     >
//                       <AppleIcon sx={{ fontSize: 17 }} className="m-0 p-0" />
//                       <span className="m-0 p-0">App store</span>
//                     </button>
//                     <button
//                       className="btn btn-solid py-1 px-3 d-flex align-items-center gap-1 rounded-1"
//                       style={{ fontSize: 10, cursor: "pointer" }}
//                       onClick={handleRedirectPlayStore}
//                     >
//                       <ShopIcon sx={{ fontSize: 17 }} className="m-0 p-0" />
//                       <span className="m-0 p-0">Play store</span>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </section>
//       )}

//       <ModalBase
//         isOpen={openNewChatPopup}
//         toggle={() => setOpenNewChatPopup(false)}
//       >
//         <div className="d-flex flex-column align-items-stretch">
//           <h6 className="text-center mb-3">How Can We Assist You ? </h6>
//           <p className="text-center">
//             Choose what type of assitense you want ?
//           </p>
//           <div className="d-flex flex-wrap justify-content-center align-items-center gap-2 m-0 p-0 py-2 chat-create-types">
//             <p
//               style={{
//                 backgroundColor: "lightgray",
//                 padding: "13px 25px",
//                 borderRadius: "20px",
//                 color: "white",
//                 cursor: "pointer",
//               }}
//               className="m-0 my-2"
//               onClick={() => handleCreateChat("General support")}
//             >
//               General support{" "}
//             </p>
//             <p
//               style={{
//                 backgroundColor: "lightgray",
//                 padding: "13px 25px",
//                 borderRadius: "20px",
//                 color: "white",
//                 cursor: "pointer",
//               }}
//               className="m-0 my-2"
//               onClick={() => handleCreateChat("Product Assistance")}
//             >
//               Product Assistance{" "}
//             </p>
//             <p
//               style={{
//                 backgroundColor: "lightgray",
//                 padding: "13px 25px",
//                 borderRadius: "20px",
//                 color: "white",
//                 cursor: "pointer",
//               }}
//               className="m-0 my-2"
//               onClick={() => handleCreateChat("Product Assistance")}
//             >
//               Tour Assistance{" "}
//             </p>
//             <p
//               style={{
//                 backgroundColor: "lightgray",
//                 padding: "13px 25px",
//                 borderRadius: "20px",
//                 color: "white",
//                 cursor: "pointer",
//               }}
//               className="m-0 my-2"
//               onClick={() => handleCreateChat("Checkout Guidance")}
//             >
//               Checkout Guidance{" "}
//             </p>
//             <p
//               style={{
//                 backgroundColor: "lightgray",
//                 padding: "13px 25px",
//                 borderRadius: "20px",
//                 color: "white",
//                 cursor: "pointer",
//               }}
//               className="m-0 my-2"
//               onClick={() => handleCreateChat("Order Assitance")}
//             >
//               Order Assitance{" "}
//             </p>
//             <p
//               style={{
//                 backgroundColor: "lightgray",
//                 padding: "13px 25px",
//                 borderRadius: "20px",
//                 color: "white",
//                 cursor: "pointer",
//               }}
//               className="m-0 my-2"
//               onClick={() => handleCreateChat("Tech Support")}
//             >
//               Tech Support{" "}
//             </p>
//           </div>
//         </div>
//       </ModalBase>
//     </CommonLayout>
//   );
// }

// export default Chats;

import Link from "next/link";
import { Media, Spinner } from "reactstrap";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../../../../firebase";
import { AppContext } from "../../../_app";

import defaultimage from "/public/assets/images/NavbarImages/defaultImage.png";
import aahaasLogo from "../../../../public/assets/images/icon/favicon.png";

import CommonLayout from "../../../../components/shop/common-layout";
import ModalBase from "../../../../components/common/Modals/ModalBase";
import ToastMessage from "../../../../components/Notification/ToastMessage";

// Import chat responsive styles
import "./chatresponsive.module.css";

import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import { Delete } from "@mui/icons-material";

import AppleIcon from "@mui/icons-material/Apple";
import ShopIcon from "@mui/icons-material/Shop";
import { LazyLoadImage } from "react-lazy-load-image-component";
import GetProfileImage from "../../../../AxiosCalls/GetProfileImage";
import { Skeleton } from "@mui/material";

function Chats() {
  const router = useRouter();
  const messageContailerRef = useRef(null);

  const { userStatus, baseUserId } = useContext(AppContext);

  const [chatListsLoad, setChatListsLoad] = useState(true);
  const [chatLists, setChatLists] = useState([]);
  const [filteredChatLists, setFilteredChatLists] = useState([]);

  const [messages, setMessages] = useState([]);
  const [noMessages, setNoMessages] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);

  const [openChatDetails, setOpenChatDetails] = useState({
    status: false,
    chatId: "",
    chatDetails: "",
  });

  const [openNewChatPopup, setOpenNewChatPopup] = useState(false);
  const [openExistingChatModal, setOpenExistingChatModal] = useState(false);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [existingChatData, setExistingChatData] = useState(null);
  const [pendingChatType, setPendingChatType] = useState("");

  const handleOpenChats = async (value) => {
    router.replace({
      pathname: "/page/account/chats",
      query: { oID: value.id },

    });
    setOpenChatDetails({
      status: true,
      chatId: value.id,
      chatDetails: value,
    });
    console.log("value hotel image", value);
    const chatDocRef = doc(db, "customer-chat-lists/", value.id);
    const chatDocSnap = await getDoc(chatDocRef);
    if (chatDocSnap.exists()) {
      const updateData = {
        customer_unreads: 0,
      };
      await updateDoc(chatDocRef, updateData);
    }
  };

  const handleCloseChats = () => {
    setOpenChatDetails({
      status: false,
      chatId: "",
      chatDetails: "",
    });
    router.replace({
      pathname: "/page/account/chats",
      query: { oID: value.id },
    });

  };

  const groupMessagesByDate = (messages) => {
    return messages.reduce((acc, message) => {
      const date = formatDate(message.createdAt);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(message);
      return acc;
    }, {});
  };

  const getChatMessages = async () => {
    const q = query(
      collection(db, "chat-updated/chats/" + openChatDetails.chatId),
      orderBy("createdAt", "desc")
    );
    //     const q = query(
    //   collection(db, "customer-chat-lists"),
    //   where("status", "!=", "Deleted"),
    //   // orderBy("updatedAt", "desc")
    // );
    const getmessages = onSnapshot(q, (QuerySnapshot) => {
      const fetchedMessages = [];
      QuerySnapshot.forEach((doc) => {
        fetchedMessages.push({ ...doc.data(), id: doc.id });
      });
      const sortedMessages = fetchedMessages.toSorted(
        (a, b) => a.createdAt - b.createdAt
      );
      if (sortedMessages.length === 0) {
        setNoMessages(true);
        setMessages({});
      } else {
        let result = groupMessagesByDate(sortedMessages);
        console.log("result", result);
        setMessages(result);
      }
    });
    return () => getmessages();
  };

  // const fetchUserChats = async () => {
  //   const q = query(
  //     collection(db, "customer-chat-lists"),
  //     orderBy("updatedAt", "desc")
  //   );
  //   const getmessages = onSnapshot(q, (QuerySnapshot) => {
  //     const fetchedMessages = [];
  //     QuerySnapshot.forEach((doc) => {
  //       fetchedMessages.push({ ...doc.data(), id: doc.id });
  //     });
  //     let chatlist = fetchedMessages.filter((value) => {
  //       return Number(value.customer_id) === Number(baseUserId.cxid);
  //     });
  //     setChatListsLoad(false);
  //     setChatLists(chatlist);
  //     console.log("chatlist", chatlist);
  //     setFilteredChatLists(chatlist);
  //     setLoadingChats(false);
  //   });
  //   return () => getmessages();
  // };

  const fetchUserChats = async () => {
    const q = query(
      collection(db, "customer-chat-lists"),
      orderBy("updatedAt", "desc")
    );
    const getmessages = onSnapshot(q, (QuerySnapshot) => {
      const fetchedMessages = [];
      QuerySnapshot.forEach((doc) => {
        fetchedMessages.push({ ...doc.data(), id: doc.id });
      });
      let chatlist = fetchedMessages.filter((value) => {
        return Number(value.customer_id) === Number(baseUserId.cxid) && !value.deletedAt;
      });
      setChatListsLoad(false);
      setChatLists(chatlist);
      console.log("chatlist", chatlist);
      setFilteredChatLists(chatlist);
      setLoadingChats(false);
    });
    return () => getmessages();
  };

  const getDateAndtime = (value) => {
    let dateTime;

    // Check if it's a Firebase Timestamp object
    if (value && typeof value === "object" && value.seconds !== undefined) {
      const totalSeconds = value.seconds + value.nanoseconds / 1e9;
      dateTime = new Date(totalSeconds * 1000);
    }
    // Check if it's an ISO string or regular date string
    else if (typeof value === "string") {
      dateTime = new Date(value);
    }
    // Check if it's already a Date object
    else if (value instanceof Date) {
      dateTime = value;
    }
    // Fallback - try to convert whatever it is
    else {
      dateTime = new Date(value);
    }

    // Validate the date
    if (isNaN(dateTime.getTime())) {
      return "Invalid date";
    }

    const currentDate = new Date();
    const formattedTime = dateTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    let formattedDateTime;

    const isSameDay = dateTime.toDateString() === currentDate.toDateString();

    // Create a copy of currentDate to avoid mutation
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = yesterday.toDateString() === dateTime.toDateString();

    if (isSameDay) {
      formattedDateTime = `Today, ${formattedTime}`;
    } else if (isYesterday) {
      formattedDateTime = `Yesterday, ${formattedTime}`;
    } else {
      formattedDateTime = dateTime.toLocaleString();
    }

    return formattedDateTime;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toISOString().split("T")[0];
  };

  const [userMessage, setUserMessage] = useState("");

  const handleSendMessage = async () => {
    if (userMessage.trim() === "") {
      ToastMessage({
        status: "warning",
        message: "Please enter a message",
      });
    } else {
      setUserMessage("");
      await addDoc(
        collection(db, "chat-updated/chats/" + openChatDetails.chatId),
        {
          text: userMessage,
          name: baseUserId.user_username,
          avatar: baseUserId.pro_pic,
          createdAt: new Date(),
          role: "Customer",
          uid: baseUserId.cxid,
        }
      );
      await getChatMessages();
      await handleUpdateMessage(openChatDetails.chatId);
    }
  };

  const handleUserMessage = (value) => {
    setUserMessage(value);
  };

  const handleKeyUp = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleUpdateMessage = async (chatID) => {
    const chatDocRef = doc(db, "customer-chat-lists/", chatID);
    const chatDocSnap = await getDoc(chatDocRef);
    if (chatDocSnap.exists()) {
      const updateData = {
        notifyAdmin: true,
        notifySupplier: true,
        updatedAt: new Date(),
        last_message: {
          name: baseUserId.user_username,
          value: userMessage,
        },
      };
      await updateDoc(chatDocRef, updateData);
    }
  };

  // Check if existing chat already exists for the selected type
  const checkExistingChat = async (userId, chatType) => {
    const chatName = `Aahaas Conversation ${chatType}`;
    const chatRef = collection(db, "customer-chat-lists");
    const q = query(
      chatRef,
      where("customer_collection_id", "==", userId),
      where("chat_name", "==", chatName)
    );

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        // Found existing chat
        const existingChat = querySnapshot.docs[0];
        setExistingChatData({
          id: existingChat.id,
          ...existingChat.data(),
        });
        setPendingChatType(chatType);
        setOpenNewChatPopup(false);
        setOpenExistingChatModal(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking existing chat:", error);
      return false;
    }
  };

  // Handle chat type selection with existing chat check
  const handleChatTypeSelection = async (chatType) => {
    const existingChatFound = await checkExistingChat(
      baseUserId.cxid,
      chatType
    );

    if (!existingChatFound) {
      // No existing chat found, create new one
      handleCreateChat(chatType);
    }
  };

  // Handle using existing chat
  const handleUseExistingChat = () => {
    setOpenExistingChatModal(false);
    handleOpenChats(existingChatData);
    setExistingChatData(null);
    setPendingChatType("");
  };

  // Handle creating new chat (when existing chat exists)
  const handleCreateNewChatAnyway = () => {
    setOpenExistingChatModal(false);
    handleCreateChat(pendingChatType);
    setExistingChatData(null);
    setPendingChatType("");
  };

  const handleCreateChat = async (chatType) => {
    setOpenNewChatPopup(false);

    try {
      // Create the new chat document
      const docRef = await addDoc(collection(db, "customer-chat-lists"), {
        status: "Pending",
        createdAt: new Date(),
        supplierAdded: false,
        notifyAdmin: true,
        notifySupplier: true,
        notifyCustomer: false,
        customer_collection_id: baseUserId.cxid,
        supplier_id: "",
        supplier_name: "",
        group_chat: false,
        customer_name: baseUserId.user_username,
        customer_mail_id: baseUserId.user_email,
        supplier_mail_id: "",
        supplier_added_date: "",
        comments: "Technical support - chat has been created from chat page",
        chat_name: `Aahaas Conversation ${chatType}`,
        customer_id: baseUserId.cxid,
        chat_related: "Technical-support",
        chat_avatar: "",
        updatedAt: new Date(),
        customer_unreads: 0,
      });

      // Refresh the chat list
      await fetchUserChats();

      // Create chat details object for the newly created chat
      const newChatDetails = {
        id: docRef.id,
        status: "Pending",
        createdAt: new Date(),
        supplierAdded: false,
        notifyAdmin: true,
        notifySupplier: true,
        notifyCustomer: false,
        customer_collection_id: baseUserId.cxid,
        supplier_id: "",
        supplier_name: "",
        group_chat: false,
        customer_name: baseUserId.user_username,
        customer_mail_id: baseUserId.user_email,
        supplier_mail_id: "",
        supplier_added_date: "",
        comments: "Technical support - chat has been created from chat page",
        chat_name: `Aahaas Conversation ${chatType}`,
        customer_id: baseUserId.cxid,
        chat_related: "Technical-support",
        chat_avatar: "",
        updatedAt: new Date(),
        customer_unreads: 0,
      };

      // Automatically open the newly created chat
      handleOpenChats(newChatDetails);
    } catch (error) {
      console.error("Error creating chat:", error);
      ToastMessage({
        status: "error",
        message: "Failed to create chat. Please try again.",
      });
    }
  };

  const createNewChat = async () => {
    if (userStatus.userLoggesIn) {
      setOpenNewChatPopup(true);
    } else {
      router.push("/page/account/login-auth");
      localStorage.setItem("lastPath", router.asPath);
      ToastMessage({
        status: "error",
        message:
          "You are logged in as a guest user. Please login to access the full system features",
      });
    }
  };

  const [userSearchChat, setUserSearchChat] = useState("");

  const handleChatSearch = (value) => {
    setUserSearchChat(value);
    let filtered = chatLists.filter((chatData) => {
      return chatData.chat_name
        .toLowerCase()
        .trim()
        .replace(/ /g, "")
        .includes(value);
    });
    setFilteredChatLists(filtered);
  };

  const handlleRedirectAppStore = () => {
    window.open(`https://apps.apple.com/lk/app/aahaas/id6450589764`, "_blank");
  };

  const handleRedirectPlayStore = () => {
    window.open(
      `https://play.google.com/store/apps/details?id=com.aahaastech.aahaas&pcampaignid=web_share`,
      "_blank"
    );
  };

  useEffect(() => {
    if (messageContailerRef.current) {
      messageContailerRef.current.scrollTop =
        messageContailerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (openChatDetails.status) {
      setMessages([]);
      getChatMessages();
    }
  }, [openChatDetails]);

  useEffect(() => {
    fetchUserChats();
  }, []);

  useEffect(() => {
    if (router.query.oID && !chatListsLoad) {
      let value = chatLists.filter((value) => {
        return value.id == router.query.oID;
      });
      if (value.length > 0) {
        setOpenChatDetails({
          status: true,
          chatId: value[0].id,
          chatDetails: value[0],
        });
      }

    }
  }, [router.query.oID, chatListsLoad]);

  const [chatIdToDelete, setChatIdToDelete] = useState(null);
  const handleDeleteChat = async (chatId) => {
  try {
    const chatDocRef = doc(db, "customer-chat-lists", chatId);
    const chatDocSnap = await getDoc(chatDocRef);

    if (chatDocSnap.exists()) {
      const updateData = {
        deletedAt: new Date(),
        updatedAt: new Date(),
        status: "Deleted",
      };
      await updateDoc(chatDocRef, updateData);
    }

    ToastMessage({
      status: "success",
      message: "The conversation has been successfully removed",
    });

    setDeleteConfirmationModal(false);
    setChatIdToDelete(null);

    // 🔥 Close open chat if the same chat is deleted
    if (openChatDetails.chatId === chatId) {
      setOpenChatDetails({
        status: false,
        chatId: "",
        chatDetails: "",
      });

      // ❗ FIXED — removed the invalid 'value.id'
      router.replace("/page/account/chats");
    }

  } catch (error) {
    console.error("Error deleting chat: ", error);
    ToastMessage({
      status: "error",
      message: "Unable to delete the conversation. Please try again",
    });
  }
};



  const handleDeleteModelToggle = (id) => {
    if (id) {
      setChatIdToDelete(id);
      setDeleteConfirmationModal(!deleteConfirmationModal);
    }
  };

  return (
    <CommonLayout
      title="chats"
      parent="home"
      showMenuIcon={false}
      showSearchIcon={true}
      showBreadcrubs={false}
    >
      {!userStatus.userLoggesIn ? (
        <div className="d-flex flex-column align-items-center justify-content-center p-5 my-5">
          <h2>Oops! something went wrong..</h2>
          <h5>
            To continue, please log in to your account. This helps us provide a
            personalized experience and keep your information secure.
          </h5>
          <Link
            href="/page/account/login-auth/"
            className="btn btn-solid btn-sm mt-4"
          >
            Login / Register
          </Link>
        </div>
      ) : loadingChats ? (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <div
            className="loader-wrapper"
            style={{
              position: "relative",
              height: "auto",
              width: "auto",
              marginTop: "50px",
            }}
          >
            <div className="loader"></div>
          </div>
        </div>
      ) : chatLists.length === 0 ? (
        <section className="row container pe-3 ps-1 py-3 col-12 mx-auto my-5 m-0 position-relative justify-content-center">
          <div className="col-8 my-5 d-flex flex-column align-items-center">
            <h3>Oops! Looks like there are no chats yet.</h3>
            <p>
              Please start a new chat to continue. This helps us provide more
              personalized assistance for your questions.
            </p>
            <button
              className="btn btn-solid py-1 px-3 rounded-1"
              style={{ fontSize: 10 }}
              onClick={createNewChat}
            >
              Create a new chat
            </button>
          </div>
        </section>
      ) : (
        <section className="row container border pe-2 ps-2 pe-md-3 ps-md-1 rounded-3 py-3 col-12 mx-auto my-3 my-md-5 m-0 position-relative">
          <div className={`new-chatLists d-flex align-items-start flex-column col-12 col-md-3 row-gap-2 ${openChatDetails.status ? 'd-none d-md-flex' : 'd-flex'}`}>
            <div className="chat-moreTools">
              <div className="chat-searchInput">
                <SearchIcon className="chat-searchInput-icon" />
                <input
                  placeholder="Search chats.."
                  value={userSearchChat}
                  onChange={(e) => {
                    handleChatSearch(e.target.value);
                  }}
                  style={{ fontSize: '16px' }} // Prevents zoom on iOS
                />
                {userSearchChat && (
                  <CloseIcon
                    className="chat-searchInput-icon"
                    onClick={() => {
                      setUserSearchChat("");
                      setFilteredChatLists(chatLists);
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                )}
                <AddIcon
                  className="chat-searchInput-icon"
                  onClick={createNewChat}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>
            {filteredChatLists.map((value, key) => (
              <div
                key={key}
                className={`w-100 p-3 rounded-3 chatLists-container-${value.id === openChatDetails.chatId ? "active" : "nonActive"
                  }`}
                onClick={() => handleOpenChats(value)}
                style={{ cursor: 'pointer', userSelect: 'none', touchAction: 'manipulation' }}
              >
                <div className="d-flex align-items-center gap-2 position-relative">
                  <Media
                    src={
                      !value.chat_avatar ||
                        typeof value.chat_avatar !== "string"
                        ? aahaasLogo?.src
                        : value.chat_avatar.split(",")[0]
                    }
                    onClick={() => handleOpenChats(value)}
                    className="chat-avatar"
                  />
                  <div className="d-flex flex-column align-items-start" onClick={() => handleOpenChats(value)}>
                    <h6 className="m-0 p-0 ellipsis-1-lines">
                      {value.chat_name}
                    </h6>
                    <p className="m-0 p-0 ellipsis-1-lines">
                      {value?.last_message?.value
                        ? value?.last_message?.value
                        : "Start a conversation"}
                    </p>
                  </div>
                  {Number(value.customer_unreads) > 0 && (
                    <span className="customer_unreads">
                      {Number(value.customer_unreads) <= 9
                        ? value.customer_unreads
                        : "9+"}
                    </span>
                  )}
                  <Delete
                    className="delete-icon"
                    onClick={(e) => {
                      e.stopPropagation(); // 🔥 This prevents the chat from opening
                      handleDeleteModelToggle(value.id);
                    }}
                    style={{
                      cursor: "pointer",
                      marginLeft: "auto",
                      color: "#666",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={`col-12 col-md-9 m-0 p-0 ${openChatDetails.status ? 'd-block' : 'd-none d-md-block'}`}>
            {openChatDetails.status ? (
              <div className={`m-0 p-0 chat-content-show`}>
                <div className="chat-content-head d-flex align-items-center gap-2">
                  {/* Mobile back button */}
                  <button
                    className="btn d-md-none p-1 me-2"
                    onClick={() => handleCloseChats()}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '6px',
                      color: 'white'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                  </button>
                  <Media
                    className="border"
                    src={
                      openChatDetails.chatDetails.chat_avatar
                        ? openChatDetails.chatDetails.chat_avatar.split(",")[0]
                        : aahaasLogo.src
                    }
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      padding: "6px",
                      backgroundColor: "white",
                    }}
                  />
                  <div className="d-flex flex-column align-items-start m-0 p-0">
                    <h6
                      className="m-0 ellipsis-1-lines"
                      title={openChatDetails.chatDetails.chat_name}
                    >
                      {openChatDetails.chatDetails.chat_name}
                    </h6>
                    <p
                      className="m-0 ellipsis-1-lines"
                      style={{
                        color: "white",
                        fontSize: "12px",
                        letterSpacing: "1px",
                      }}
                    >
                      {console.log("openChatDetails", openChatDetails)}
                      {getDateAndtime(openChatDetails.chatDetails.updatedAt) ||
                        new Date()}
                    </p>
                  </div>
                  <CloseIcon
                    className="ms-auto border my-auto rounded-3"
                    sx={{ fontSize: 25 }}
                    onClick={() => handleCloseChats()}
                  />
                </div>

                <div className="messageContailerRef" ref={messageContailerRef}>
                  {Object.keys(messages).map((date) => (
                    <div key={date} className="d-flex flex-column">
                      <span
                        className="col my-3"
                        style={{ textAlign: "center" }}
                      >
                        {date}
                      </span>
                      {messages[date].map((value, key) => (
                        <div
                          key={key}
                          className={
                            value.uid == baseUserId.cxid
                              ? "mb-3 gap-2 d-flex chat-right justify-content-start flex-row-reverse align-items-start ms-auto"
                              : "mb-3 gap-2 d-flex chat-left justify-content-start me-auto align-items-start"
                          }
                        >
                          {value.uid == baseUserId.cxid ? (
                            <GetProfileImage data={baseUserId.pro_pic} />
                          ) : (
                            <Media
                              alt="chat user profile"
                              src={aahaasLogo.src}
                              style={{
                                minHeight: "30px",
                                maxHeight: "30px",
                                minWidth: "30px",
                                maxWidth: "30px",
                                borderRadius: "50%",
                              }}
                              className={`${value.userId == baseUserId.cxid ? "" : ""
                                }`}
                            />
                          )}
                          <div
                            className={`d-flex flex-column gap-0 ${value.uid == baseUserId.cxid
                                ? "align-items-end text-end"
                                : "align-items-start text-start"
                              }`}
                          >
                            <p
                              className="m-0 p-0"
                              style={{
                                lineHeight: "20px",
                                textAlign:
                                  value.uid == baseUserId.cxid ? "" : "",
                                fontSize: 14,
                              }}
                            >
                              {value.text}
                            </p>
                            <span
                              style={{
                                fontSize: 10,
                                textAlign:
                                  value.uid == baseUserId.cxid ? "" : "",
                              }}
                            >
                              {getDateAndtime(value.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="d-flex align-items-center gap-2 mb-3 chat-send-container">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your message.."
                    style={{
                      fontSize: 14,
                      padding: "12px 16px",
                      borderRadius: "20px",
                      border: "1px solid #e9ecef"
                    }}
                    value={userMessage}
                    onChange={(e) => handleUserMessage(e.target.value)}
                    onKeyUp={handleKeyUp}
                  />
                  <button
                    className="btn"
                    onClick={handleSendMessage}
                    style={{
                      // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0'
                    }}
                  >
                    <SendIcon sx={{ fontSize: 16 }} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="m-0 p-0 chat-content-show d-flex align-items-center justify-content-center">
                <div className="col-8 my-5 d-flex flex-column align-items-center">
                  <h3>Download our mobile application</h3>
                  <p className="text-center" style={{ lineHeight: "20px" }}>
                    Enjoy the full Aahaas experience wherever you are. Our app
                    offers advanced security features and is optimized for fast,
                    reliable transactions. Please download the app to proceed
                    with your purchase.
                  </p>
                  <div className="d-flex align-items-center gap-3">
                    <button
                      className="btn btn-solid py-1 px-3 d-flex align-items-center gap-1 rounded-1"
                      style={{ fontSize: 10, cursor: "pointer" }}
                      onClick={handlleRedirectAppStore}
                    >
                      <AppleIcon sx={{ fontSize: 17 }} className="m-0 p-0" />
                      <span className="m-0 p-0">App store</span>
                    </button>
                    <button
                      className="btn btn-solid py-1 px-3 d-flex align-items-center gap-1 rounded-1"
                      style={{ fontSize: 10, cursor: "pointer" }}
                      onClick={handleRedirectPlayStore}
                    >
                      <ShopIcon sx={{ fontSize: 17 }} className="m-0 p-0" />
                      <span className="m-0 p-0">Play store</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Chat Type Selection Modal */}
      <ModalBase
        isOpen={openNewChatPopup}
        toggle={() => setOpenNewChatPopup(false)}
      >
        <div className="d-flex flex-column align-items-stretch">
          <h6 className="text-center mb-3">How Can We Assist You ?</h6>
          <p className="text-center">
            Please select the type of assistance you require
          </p>
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-2 m-0 p-0 py-2 chat-create-types">
            <p
              style={{
                backgroundColor: "lightgray",
                padding: "13px 25px",
                borderRadius: "20px",
                color: "white",
                cursor: "pointer",
              }}
              className="m-0 my-2"
              onClick={() => handleChatTypeSelection("General support")}
            >
              General support
            </p>
            <p
              style={{
                backgroundColor: "lightgray",
                padding: "13px 25px",
                borderRadius: "20px",
                color: "white",
                cursor: "pointer",
              }}
              className="m-0 my-2"
              onClick={() => handleChatTypeSelection("Product Assistance")}
            >
              Product Assistance
            </p>
            <p
              style={{
                backgroundColor: "lightgray",
                padding: "13px 25px",
                borderRadius: "20px",
                color: "white",
                cursor: "pointer",
              }}
              className="m-0 my-2"
              onClick={() => handleChatTypeSelection("Tour Assistance")}
            >
              Tour Assistance
            </p>
            <p
              style={{
                backgroundColor: "lightgray",
                padding: "13px 25px",
                borderRadius: "20px",
                color: "white",
                cursor: "pointer",
              }}
              className="m-0 my-2"
              onClick={() => handleChatTypeSelection("Checkout Guidance")}
            >
              Checkout Guidance
            </p>
            <p
              style={{
                backgroundColor: "lightgray",
                padding: "13px 25px",
                borderRadius: "20px",
                color: "white",
                cursor: "pointer",
              }}
              className="m-0 my-2"
              onClick={() => handleChatTypeSelection("Order Assistance")}
            >
              Order Assistance
            </p>
            <p
              style={{
                backgroundColor: "lightgray",
                padding: "13px 25px",
                borderRadius: "20px",
                color: "white",
                cursor: "pointer",
              }}
              className="m-0 my-2"
              onClick={() => handleChatTypeSelection("Tech Support")}
            >
              Tech Support
            </p>
            <p
              style={{
                backgroundColor: "lightgray",
                padding: "13px 25px",
                borderRadius: "20px",
                color: "white",
                cursor: "pointer",
              }}
              className="m-0 my-2"
              onClick={() => handleChatTypeSelection("Flight Assistance")}
            >
              Flight Assistance
            </p>
          </div>
        </div>
      </ModalBase>

      {/* Existing Chat Found Modal */}
      <ModalBase
        isOpen={openExistingChatModal}
        toggle={() => setOpenExistingChatModal(false)}
      >
        <div className="d-flex flex-column align-items-stretch">
          <h6 className="text-center mb-3">Existing Chat Found</h6>
          <p className="text-center mb-4">
            You already have a chat for "{pendingChatType}". Would you like to
            continue with the existing chat or create a new one?
          </p>

          {existingChatData && (
            <div
              className="mb-4 p-3 border rounded-3"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <div className="d-flex align-items-center gap-2">
                <Media
                  src={
                    !existingChatData.chat_avatar ||
                      typeof existingChatData.chat_avatar !== "string"
                      ? aahaasLogo?.src
                      : existingChatData.chat_avatar.split(",")[0]
                  }
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <div className="d-flex flex-column align-items-start">
                  <h6 className="m-0 p-0" style={{ fontSize: "14px" }}>
                    {existingChatData.chat_name}
                  </h6>
                  <p
                    className="m-0 p-0"
                    style={{ fontSize: "12px", color: "#6c757d" }}
                  >
                    Last updated:{" "}
                    {existingChatData.updatedAt
                      ? getDateAndtime(existingChatData.updatedAt)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="d-flex gap-3 justify-content-center">
            <button
              className="btn btn-outline-primary px-4 py-2"
              onClick={handleUseExistingChat}
            >
              Use Existing Chat
            </button>
            <button
              className="btn btn-solid px-4 py-2"
              onClick={handleCreateNewChatAnyway}
            >
              Create New Chat
            </button>
          </div>
        </div>
      </ModalBase>

      <ModalBase
        isOpen={deleteConfirmationModal}
        toggle={() => setDeleteConfirmationModal(false)}
      >
        <div className="d-flex flex-column align-items-stretch">
          <h6 className="text-center mb-3">Delete Chat</h6>
          <p className="text-center mb-4">
            Are you sure you want to delete this chat? This conversation and all
            its messages will be permanently deleted and cannot be recovered.
          </p>

          <div className="d-flex gap-3 justify-content-center">
            <button
              className="btn btn-outline-secondary px-4 py-2"
              onClick={() => setDeleteConfirmationModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger px-4 py-2"
              onClick={() => {
                // Call your delete function here
                handleDeleteChat(chatIdToDelete);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </ModalBase>
    </CommonLayout>
  );
}

export default Chats;
