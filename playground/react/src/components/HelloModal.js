import React, { useState } from 'react';
import { Button, Modal } from 'antd';

export default function () {
  window.appName = "react";
  const [visible, setVisible] = useState(false);
  const onButtonClick = () => {
    console.log(window.appName)
    setVisible(true);
  }
  return (
    <>
      <Button onClick={() => onButtonClick()}>CLICK ME</Button>
      <Modal visible={visible} onOk={() => setVisible(false)} onCancel={() => setVisible(false)} title="single-spa">
        Probably the most complete micro-frontends solution you ever met
      </Modal>
    </>
  );
}
