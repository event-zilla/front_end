import React, { useState,useEffect } from 'react'
import { View, Text,Image,PermissionsAndroid, ScrollView,Dimensions, Linking } from 'react-native';
import { Header } from 'react-native-elements/dist/header/Header';
import { Input } from 'react-native-elements';
import { launchImageLibrary } from 'react-native-image-picker';
import { Button } from 'react-native-elements';
import { postData, postDataAndImage,ServerURL } from './FetchAllServices';
import { Overlay } from 'react-native-elements';
import {RNFetchBlob} from "rn-fetch-blob"
// const { config, fs } = RNFetchBlob;
//   const { DownloadDir } = fs.dirs;

const requestDownloadPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: "Cool IIIT Bhopal Background Image Download Permission",
        message:"give permmision form download image generate by app",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can use the memory");
    } else {
      console.log("memory permission denied");
    }
  } catch (err) {
    console.warn(err);
  }
};

const downloadImage=(filename)=>{
  const DownloadDir=RNFetchBlob.fs.dirs.DownloadDir
  const options = {
    fileCache: true,
    addAndroidDownloads: {
      useDownloadManager: true, // true will use native manager and be shown on notification bar.
      notification: true,
      path: `${DownloadDir}/${filename}`,
      description: 'Downloading.',
    },
  };

  RNFetchBlob.config(options).fetch('GET', `${ServerURL}/images/${filename}`).then((res) => {
    console.log('do some magic in here');
  });
}

const HomeScreen = ()=>{
    useEffect(()=>{
      requestDownloadPermission()
    },[])
    const [photo, setPhoto] = React.useState(null);
    const [finalImages, setFinalImages] = useState('')
    const [finalCount, setFinalCount] = useState(0)
    const [eventType, setEventType] = useState('')
    const [keyWord, setKeyWord] = useState('')

    const [visible, setVisible] = useState(false);

    const toggleOverlay = async() => {
      if(visible){
        let res=await postData("deleteimage",{count:finalCount,filename:finalImages})
        console.log(res)
        setPhoto(null);
        setEventType("")
        setKeyWord("")
        setFinalCount(0)
        setFinalImages([])
      }
      setVisible(!visible);
    };
    
    const handleChoosePhoto = () => {
    
        var err = false ;
        if(eventType==''){
          err=true;
        }
        if(keyWord==''){err=true}
        

        if(!err ){
        launchImageLibrary({ noData: true }, (response) => {
          if (response && response.assets != undefined) {
            if(response.assets[0].type=='image/jpeg'){
              console.log(response)
              setPhoto(response);
            }else
            {
              alert("Please upload image only")
            }
          }
        });
      }else{
        alert("Enter All Fields")
      }
      };

      const uploadPhoto = async() =>{
        var data = new FormData();
        
    data.append('picture', {
      name: photo.assets[0].fileName,
      type: photo.assets[0].type,
      uri: Platform.OS === 'ios' ? photo.assets[0].uri.replace('file://', '') : photo.assets[0].uri,
    });
       
        data.append('eventType',eventType)
        data.append('keyword',keyWord)
        console.log(data)
        var config = { headers:{'content-type':'multipart/form-data'}}
        var result = await postDataAndImage('setbackground',data,config);
        console.log(JSON.stringify(result))
        if(result.status){
          setFinalImages(result.filename)
          setFinalCount(result.count)
          toggleOverlay()
        }
      }

      const showUpdatedImages=()=>{
       

        console.log(finalCount) 
        let image=[]
        for(let i=0;i<finalCount;i++){
          image.push(i)
        }
        console.log(image)
     
        return(
          image.map((item,index)=>{
          return(    
          <View key={item} style={{display:'flex', flex:1,justifyContent:'center', alignItems:'center'}}>
            
            <Image source={{uri:`${ServerURL}/images/${finalImages}${item}.png`}} style={{width:300,height:300, resizeMode:'contain'}} />
            <View style={{display:'flex', flexDirection:'row',padding:10}}>
            <View style={{margin:10 ,width:"100%"}}>
            <Button title={"Download"} onPress={()=>{Linking.openURL(`${ServerURL}/images/${finalImages}${item}.png`)}}></Button>
            </View>
            
            </View>
          </View>
          )
        }))
      }
      const [screenHeight,setScreenHieght] =useState( Dimensions.get('window').height)
    return (
     
        <ScrollView style={{minHeight:screenHeight+40,maxHeight:"60%"}} >
        <View>
            <Header
            centerComponent={{ text: 'EVENT-ZILLA', style: { color: '#fff',margin:10,fontSize:20 } }}
            containerStyle={{
                backgroundColor: '#3D6DCC',
                justifyContent: 'space-around',
              }}
            />
            <View style={{display:'flex', alignItems:'center',marginTop:20}}>
           <Image  source={require('./logo1.png')} style={{width:100,height:100, resizeMode:'contain'}} />
           </View>
           <View style={{margin:20, display:'flex', alignItems:'center', justifyContent:'center'}}>
               <Text style={{fontSize:20,fontWeight:'bold'}}  >Generate Background Image</Text>
               <Input style={{marginTop:15}}
             placeholder='Event Type'
             value={eventType}
             onChangeText={(text)=>setEventType(text)}
/>
            <Input  style={{marginTop:15}}
                        value={keyWord}
                        placeholder='Keywords eg: cricket, party etc.'
                        onChangeText={(text)=>{setKeyWord(text)}}
            />
          <View style={{ display:'flex', alignItems: 'center',justifyContent:'center' }}>
                {photo? (
                  <View>
                    <Image
                      source={{ uri: photo.assets[0].uri }}
                      style={{ width: 300, height: 300 }}
                    />
                    <View style={{display:'flex', flexDirection:'row',padding:10}}>
                        <View style={{margin:10}}>
                    <Button  title="Generate Background" onPress={()=>uploadPhoto()} />
                    </View>
                    <View style={{margin:10}}>
                    <Button  title="Cancel" onPress={()=>setPhoto(null)} />
                    </View>
                    </View>
                  </ View>
      ):<Button title="Choose Photo" onPress={()=>handleChoosePhoto()} />}
      
    </View>
    
    <View style={{margin:10}}>
      {/* <Button title="Open Overlay" onPress={toggleOverlay} /> */}

      <Overlay   isVisible={visible} onBackdropPress={toggleOverlay}>
     <ScrollView>
     <View  style={{margin:10,width:"100%"}}>
            <Button onPress={()=>toggleOverlay()} title={"Close Gallery"}>Close Gallery</Button>
            </View>
      {showUpdatedImages()}
      </ScrollView>
      </Overlay>
    </View>


           </View>
        </View>
        </ScrollView>
    )
}

export default HomeScreen;