import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Animated
} from "react-native";
import Carousel from "react-native-snap-carousel";
import MapView from "react-native-maps";
//画像のurlを用意する
const Images = [
  {
    uri: "https://kokensha.xyz/wp-content/uploads/2019/03/member.png"
  },
  {
    uri: "https://kokensha.xyz/wp-content/uploads/2019/03/login.png"
  },
  {
    uri: "https://kokensha.xyz/wp-content/uploads/2019/03/bbs.png"
  },
  {
    uri: "https://kokensha.xyz/wp-content/uploads/2019/03/upload.png"
  },
  {
    uri: "https://kokensha.xyz/wp-content/uploads/2019/03/member2.png"
  },
  {
    uri: "https://kokensha.xyz/wp-content/uploads/2019/03/bbs.png"
  }
];

const { width, height } = Dimensions.get("window");
const CARD_HEIGHT = height / 4;
const CARD_WIDTH = CARD_HEIGHT - 50;

export default class DemoScreen extends React.Component {
  static navigationOptions = {
    title: "Demo"
  };
  state = {
    scrolledX: 0,
    markers: [
      {
        coordinate: {
          latitude: 35.741006,
          longitude: 139.7262613
        },
        title: "一番目の画像",
        description: "東京",
        image: Images[0]
      },
      {
        coordinate: {
          latitude: 34.66992,
          longitude: 135.4929573
        },
        title: "二番目の画像",
        description: "大阪",
        image: Images[1]
      },
      {
        coordinate: {
          latitude: 43.064712,
          longitude: 141.3447943
        },
        title: "三番目の画像",
        description: "札幌",
        image: Images[2]
      },
      {
        coordinate: {
          latitude: 33.594018,
          longitude: 130.3972473
        },
        title: "四番目の場所",
        description: "福岡",
        image: Images[3]
      },
      {
        coordinate: {
          latitude: 35.171078,
          longitude: 136.8814353
        },
        title: "五番目の場所",
        description: "名古屋",
        image: Images[4]
      },
      {
        coordinate: {
          latitude: 38.2593883,
          longitude: 140.8741972
        },
        title: "六番目の場所",
        description: "仙台",
        image: Images[5]
      }
    ],
    region: {
      latitude: 35.741006,
      longitude: 139.7262613,
      latitudeDelta: 1.1,
      longitudeDelta: 1.1
    }
  };

  componentWillMount() {
    this.index = 0;
    this.animation = new Animated.Value(0);
  }

  componentDidMount() {
    //アニメーション用のリスナーをつけます
    this.animation.addListener(({ value }) => {
      let index = Math.floor(value / CARD_WIDTH + 0.4);
      if (index >= this.state.markers.length) {
        index = this.state.markers.length - 1;
      }
      if (index <= 0) {
        index = 0;
      }
      clearTimeout(this.regionTimeout);
      this.regionTimeout = setTimeout(() => {
        if (this.index !== index) {
          this.index = index;
          const { coordinate } = this.state.markers[index];
          //
          this.map.animateToRegion(
            {
              ...coordinate,
              latitudeDelta: this.state.region.latitudeDelta,
              longitudeDelta: this.state.region.longitudeDelta
            },
            350
          );
        }
      }, 10);
    });
  }
  _renderItem({ item, index }) {
    return (
      <View style={styles.card} key={index}>
        <Image
          source={item.image}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.textContent}>
          <Text numberOfLines={1} style={styles.cardTitle}>
            {item.title}
          </Text>
          <Text numberOfLines={1} style={styles.cardDescription}>
            {item.description}
          </Text>
        </View>
      </View>
    );
  }
  render() {
    const interpolations = this.state.markers.map((marker, index) => {
      const inputRange = [
        (index - 1) * CARD_WIDTH,
        index * CARD_WIDTH,
        (index + 1) * CARD_WIDTH
      ];
      const scale = this.animation.interpolate({
        inputRange,
        outputRange: [1, 3, 1],
        extrapolate: "clamp"
      });
      const opacity = this.animation.interpolate({
        inputRange,
        outputRange: [0.5, 1, 0.5],
        extrapolate: "clamp"
      });
      return {
        scale,
        opacity
      };
    });
    return (
      <View style={styles.container}>
        <MapView
          ref={map => (this.map = map)}
          initialRegion={this.state.region}
          style={styles.container}
        >
          {this.state.markers.map((marker, index) => {
            const scaleStyle = {
              transform: [
                {
                  scale: interpolations[index].scale
                }
              ]
            };
            const opacityStyle = {
              opacity: interpolations[index].opacity
            };
            return (
              <MapView.Marker key={index} coordinate={marker.coordinate}>
                <Animated.View style={[styles.markerWrap, opacityStyle]}>
                  <Animated.View style={[styles.circle, scaleStyle]} />
                  <View style={styles.marker} />
                </Animated.View>
              </MapView.Marker>
            );
          })}
        </MapView>
        <Animated.View
          style={styles.scrollView}
          contentContainerStyle={styles.endPadding}
        >
          <Carousel
            loop="true"
            style={styles.carouselStyle}
            ref={c => {
              this._carousel = c;
            }}
            data={this.state.markers}
            renderItem={this._renderItem}
            sliderWidth={width}
            itemWidth={140}
            onScroll={event => {
              // console.log('scroll event',event);
              // console.log(event.nativeEvent.contentOffset.x);
              // this.setState({scrolledX:event.nativeEvent.contentOffset.x});
              this.animation.setValue(event.nativeEvent.contentOffset.x);
            }}
            useScrollView={true}
          />
        </Animated.View>
      </View>
    );
  }
}

//UI
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollView: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    paddingVertical: 10
  },
  carouselStyle: {
    padding: 15
  },
  endPadding: {
    paddingRight: width - CARD_WIDTH
  },
  card: {
    padding: 10,
    elevation: 2,
    backgroundColor: "rgba(244,255,244, 1)",
    marginHorizontal: 10,
    margin: 35,
    shadowColor: "rgba(0,153,102, 0.9)",
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: {
      x: 0,
      y: 0
    },
    height: CARD_HEIGHT,
    width: CARD_WIDTH
  },
  cardImage: {
    flex: 3,
    width: "100%",
    height: "100%",
    alignSelf: "center"
  },
  textContent: {
    flex: 1
  },
  cardTitle: {
    fontSize: 13,
    marginTop: 5,
    fontWeight: "bold"
  },
  cardDescription: {
    fontSize: 12,
    color: "#444"
  },
  markerWrap: {
    alignItems: "center",
    justifyContent: "center"
  },
  marker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(0,153,102, 0.9)"
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,153,102, 0.5)",
    position: "absolute",
    borderWidth: 0.5,
    borderColor: "rgba(0,153,102, 0.5)"
  }
});
