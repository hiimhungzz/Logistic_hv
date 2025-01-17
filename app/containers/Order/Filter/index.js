/**
 * Copyright 2020-present, TIENDUC.
 * All rights reserved.
 * @author ductt.it.hust@gmail.com on 27/06/2020.
 */

import React, { useCallback, useState , useEffect} from "react";
import { Row, Col, Select, Button, DatePicker } from "antd";
import styled from "styled-components";
import PropTypes from "prop-types";
import { DefineInput, DefineSelect, Input, DefineMultipleSelect } from "components";
import { createStructuredSelector } from "reselect";
import { makeSelectDefinitions } from "containers/App/selectors";
import { TEMP_BODY } from "../constants";
import { connect } from "react-redux";
import moment from "moment";
import ServiceBase from "utils/ServiceBase";
import { URI } from "utils/constants";
import { Ui } from "utils/Ui";
import _ from "lodash"
const { RangePicker } = DatePicker;
/*
 * Bộ lọc
 */
var fnTimeOut;
const Filter = ({ className, params, setParams, definitions }) => {
  let { order_statuses } = definitions.toJS()
  let orderStatus = _.map(order_statuses, (value, k) => {
    return value
  })
  const format = "YYYY-MM-DD";
  const searchTimeOut = function (value, key) {
    window.clearTimeout(fnTimeOut);
    fnTimeOut = window.setTimeout(function () {
      if (key) {
        queryFillter(value, key);
      }
    }, 800);
  };
  const [Source, SetSource] = useState([]);
  const [SourceOption, SetObjOption] = useState([]);
  const getlistSource = useCallback(async (objParam) => {
      const result = await ServiceBase.requestJson({
          method: "GET",
          url: URI['URI_VP'],
          data: {
              q: "",
              type:1
          },
      });
      if (result.hasErrors) {
          Ui.showErrors(result.errors);
      } else {
          SetSource(result.value.data);
      }
  })
  const getListStaff = useCallback(async (data) => {
    const result = await ServiceBase.requestJson({
        method: 'GET',
        url: URI['URI_STAFF_LIST'],
        data: {
            page: 1,
            per_page: 1000,
            active: 1,
            // id: 62
        },
    });
    // console.log('URI_STAFF_LIST', result)
    if (result.hasErrors) {
      Ui.showErrors(result.errors);
    } else {
        SetObjOption(result.value.data)
    }
})
  const queryFillter = useCallback(
    (value, name) => {
      setParams((props) => {
        let nextState = { ...props };
        nextState[name] = value;
        return nextState;
      });
    },
    [setParams]
  );
  const _clearFilter = useCallback(() => {
    setParams(TEMP_BODY);
    setOrderCode(undefined)
  }, [setParams]);
  const [orderCode, setOrderCode] = useState(params['filterBy[id]']);

  useEffect(() => {
    getListStaff()
    getlistSource()
  }, [])
  return (

    < div className={className} >
      <Row gutter={[8, 8]}>
        <Col span={4}>
          <DefineInput
            value={orderCode}
            placeholder="Mã đơn hàng"
            change={(e) => {
              let { value } = e.target;
              setOrderCode(value)
              searchTimeOut(value, 'filterBy[id]');
            }}
          />
        </Col>
        <Col span={4}>
          <DefineMultipleSelect
            placeholder="Chọn trạng thái"
            search={
              (e) => {
                searchTimeOut(e)
              }
            }
            change={(e) => {
              queryFillter(e, 'filterBy[status]')
            }
            }
            dataBin={orderStatus}
            value={params['filterBy[status]']}
            // value={(e) => {
            //   console.log(e)
            // }}
          />
        </Col>
        {/* <Col span={10}>
          <DatePicker 
            onChange={(e, v)=>{
              queryFillter(v, 'filterBy[create_date]')
            }}
            value={params['filterBy[create_date]'] ? moment(params['filterBy[create_date]']) : null}  
          />
        </Col> */}
        <Col span={4}>
          <DefineSelect
            placeholder="Chọn vp nhận"
            search={
              (e) => {
                searchTimeOut(e)
              }
            }
            change={(e) => {
              queryFillter(e, 'filterBy[source_id]')
            }
            }
            dataBin={Source}
            value={params['filterBy[source_id]']}
          />
        </Col>
        <Col span={4}>
          <DefineSelect
            placeholder="Chọn NV tạo"
            search={
              (e) => {
                searchTimeOut(e)
              }
            }
            change={(e) => {
              queryFillter(e, 'filterBy[created_by]')
            }
            }
            dataBin={SourceOption}
            value={params['filterBy[created_by]']}
          />
        </Col>
        <Col xs={6}>
          <RangePicker
            style={{ width: "100%" }}
            format={"DD-MM-YYYY"}
            value={
              params.startDate && params.endDate
                ? [moment(params.startDate), moment(params.endDate)]
                : undefined
            }
            onChange={(dates) => {

              let startDate =
                dates.length > 0
                  ? moment(dates[0].startOf("day")).format(format)
                  : undefined;
              let endDate =
                dates.length > 0
                  ? moment(dates[1].endOf("day")).format(format)
                  : undefined;
              queryFillter(startDate, "startDate");
              queryFillter(endDate, "endDate");
            }}
            ranges={{
              "Hôm nay": [moment(), moment()],
              "Tuần hiện tại": [
                moment().startOf("week"),
                moment().endOf("week"),
              ],
              "Tháng hiện tại": [
                moment().startOf("month"),
                moment().endOf("month"),
              ],
              "Tuần trước": [
                moment()
                  .add(-1, "weeks")
                  .startOf("week"),
                moment()
                  .add(-1, "weeks")
                  .endOf("week"),
              ],
              "Tháng trước": [
                moment()
                  .add(-1, "months")
                  .startOf("month"),
                moment()
                  .add(-1, "months")
                  .endOf("month"),
              ],
              "Tuần sau": [
                moment()
                  .add(1, "weeks")
                  .startOf("week"),
                moment()
                  .add(1, "weeks")
                  .endOf("week"),
              ],
              "Tháng sau": [
                moment()
                  .add(1, "months")
                  .startOf("month"),
                moment()
                  .add(1, "months")
                  .endOf("month"),
              ],
            }}
          />
        </Col>
        <Col span={2} style={{paddingLeft: '0px', marginLeft: '0px'}}>
          <Button onClick={_clearFilter}>Xóa bộ lọc</Button>
        </Col>
      </Row>
    </div >
  );
};
Filter.propTypes = {
  className: PropTypes.any,
};
const mapStateToProps = createStructuredSelector({
  definitions: makeSelectDefinitions(),
});
const withConnect = connect(
  mapStateToProps,
  null
);
export default styled(withConnect(Filter))`
  .ant-picker {
    width: 51%
  }
`;
