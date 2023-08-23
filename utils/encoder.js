const encoder = {
  base64ToJson: function (base64String) {
    const json = Buffer.from(base64String, "base64").toString();
    return JSON.parse(json);
  },
  decodeString: function (base64String, privateKey) {
    const strtoobj = Buffer.from(base64String, "base64").toString();
    const decoded = (string) => {
      let decodedStr = "";
      for (let i = 0; i < string.length; i++) {
        decodedStr += String.fromCharCode(
          string.charCodeAt(i) ^ privateKey.charCodeAt(i % privateKey.length)
        );
      }
      return decodedStr;
    };
    const decodedBase64 = decoded(strtoobj);
    return decodedBase64;
  },
  encodeString: function (object, privateKey) {
    const encoded = (string, privateKey) => {
      let encodedStr = "";
      for (let i = 0; i < string.length; i++) {
        encodedStr += String.fromCharCode(
          string.charCodeAt(i) ^ privateKey.charCodeAt(i % privateKey.length)
        );
      }
      return Buffer.from(encodedStr).toString("base64");
    };
    return encoded(object, privateKey);
  },
};

module.exports = encoder;
