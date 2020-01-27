import React from 'react'
import { useSelector } from "react-redux";

import Login from './Login'
import Account from './Account';

const AccountDetails = () => {
  const session = useSelector(state => state.session);

  if (session) return <Account />;

  return <Login />
}

export default AccountDetails;
