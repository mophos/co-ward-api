import * as Knex from 'knex';
var request = require('request');
export class FullfillModel {

  getProductsDrugs(db: Knex, orderType = null, orderSort = null) {
    let sql = `SELECT
    a.hospital_id,
    a.hospital_code,
    a.hospital_name,
    a.zone_code,
    sum(
    IF
    ( a.generic_id = 1, a.qty, 0 )) AS hydroxy_chloroquine_qty,
    sum(
    IF
    ( a.generic_id = 1, a.min, 0 )) AS hydroxy_chloroquine_min_qty,
      sum(
    IF
    ( a.generic_id = 1, a.max, 0 )) AS  hydroxy_chloroquine_max_qty,
        sum(
    IF
    ( a.generic_id = 1, a.safety_stock, 0 )) AS  hydroxy_chloroquine_safety_qty,
          sum(
    IF
    ( a.generic_id = 1, a.recommend_fill_qty, 0 )) AS  hydroxy_chloroquine_recomment_qty,
            sum(
    IF
    ( a.generic_id = 1, a.reserve_qty, 0 )) AS  hydroxy_chloroquine_reserve_qty,
              sum(
    IF
    ( a.generic_id = 1, a.total, 0 )) AS  hydroxy_chloroquine_total_qty,
    sum(
      IF
      ( a.generic_id = 1, a.req_qty, 0 )) AS  hydroxy_chloroquine_req_qty,
      
    sum(
    IF
    ( a.generic_id = 2, a.qty, 0 )) AS chloroquine_qty,
    sum(
    IF
    ( a.generic_id = 2, a.min, 0 )) AS chloroquine_min_qty,
      sum(
    IF
    ( a.generic_id = 2, a.max, 0 )) AS chloroquine_max_qty,
        sum(
    IF
    ( a.generic_id = 2, a.safety_stock, 0 )) AS chloroquine_safety_qty,
          sum(
    IF
    ( a.generic_id = 2, a.recommend_fill_qty, 0 )) AS chloroquine_recomment_qty,
            sum(
    IF
    ( a.generic_id = 2, a.reserve_qty, 0 )) AS chloroquine_reserve_qty,
              sum(
    IF
    ( a.generic_id = 2, a.total, 0 )) AS chloroquine_total_qty,
    sum(
      IF
      ( a.generic_id = 2, a.req_qty, 0 )) AS  chloroquine_req_qty,
    
    sum(
    IF
    ( a.generic_id = 3, a.qty, 0 )) AS darunavir_qty,
    sum(
    IF
    ( a.generic_id = 3, a.min, 0 )) AS darunavir_min_qty,
      sum(
    IF
    ( a.generic_id = 3, a.max, 0 )) AS darunavir_max_qty,
        sum(
    IF
    ( a.generic_id = 3, a.safety_stock, 0 )) AS darunavir_safety_qty,
          sum(
    IF
    ( a.generic_id = 3, a.recommend_fill_qty, 0 )) AS darunavir_recomment_qty,
            sum(
    IF
    ( a.generic_id = 3, a.reserve_qty, 0 )) AS darunavir_reserve_qty,
            sum(
    IF
    ( a.generic_id = 3, a.total, 0 )) AS darunavir_total_qty,	
    sum(
      IF
      ( a.generic_id = 3, a.req_qty, 0 )) AS  darunavir_req_qty,
    
    sum(
    IF
    ( a.generic_id = 4, a.qty, 0 )) AS lopinavir_qty,
    sum(
    IF
    ( a.generic_id = 4, a.min, 0 )) AS lopinavir_min_qty,
      sum(
    IF
    ( a.generic_id = 4, a.max, 0 )) AS lopinavir_max_qty,
        sum(
    IF
    ( a.generic_id = 4, a.safety_stock, 0 )) AS lopinavir_safety_qty,
          sum(
    IF
    ( a.generic_id = 4, a.recommend_fill_qty, 0 )) AS lopinavir_recomment_qty,
            sum(
    IF
    ( a.generic_id = 4, a.reserve_qty, 0 )) AS lopinavir_reserve_qty,					sum(
    IF
    ( a.generic_id = 4, a.total, 0 )) AS lopinavir_total_qty,
    sum(
      IF
      ( a.generic_id = 4, a.req_qty, 0 )) AS  lopinavir_req_qty,
    
    
    sum(
    IF
    ( a.generic_id = 5, a.qty, 0 )) AS ritonavir_qty,
    sum(
    IF
    ( a.generic_id = 5, a.min, 0 )) AS ritonavir_min_qty,
      sum(
    IF
    ( a.generic_id = 5, a.max, 0 )) AS ritonavir_max_qty,
        sum(
    IF
    ( a.generic_id = 5, a.safety_stock, 0 )) AS ritonavir_safety_qty,
          sum(
    IF
    ( a.generic_id = 5, a.recommend_fill_qty, 0 )) AS ritonavir_recomment_qty,
            sum(
    IF
    ( a.generic_id = 5, a.reserve_qty, 0 )) AS ritonavir_reserve_qty,
            sum(
    IF
    ( a.generic_id = 5, a.total, 0 )) AS ritonavir_total_qty,	
    sum(
      IF
      ( a.generic_id = 5, a.req_qty, 0 )) AS  ritonavir_req_qty,

    
    sum(
    IF
    ( a.generic_id = 7, a.qty, 0 )) AS azithromycin_qty,
    sum(
    IF
    ( a.generic_id = 7, a.min, 0 )) AS azithromycin_min_qty,
      sum(
    IF
    ( a.generic_id = 7, a.max, 0 )) AS azithromycin_max_qty,
        sum(
    IF
    ( a.generic_id = 7, a.safety_stock, 0 )) AS azithromycin_safety_qty,
          sum(
    IF
    ( a.generic_id = 7, a.recommend_fill_qty, 0 )) AS azithromycin_recomment_qty,
            sum(
    IF
    ( a.generic_id = 7, a.reserve_qty, 0 )) AS azithromycin_reserve_qty,
              sum(
    IF
    ( a.generic_id = 7, a.total, 0 )) AS azithromycin_total_qty,
    sum(
      IF
      ( a.generic_id = 7, a.req_qty, 0 )) AS  azithromycin_req_qty
  FROM
    (
  SELECT
    gp.generic_id,
    bg.name AS generic_name,
    bh.hospcode AS hospital_code,
    ns.hospital_id,
    bh.hospname AS hospital_name,
    bh.zone_code,
    g.qty,
    gp.min,
    gp.max,
    gp.safety_stock,
  if(g.qty < gp.min,
  IF
  ((
      gp.max -(
      ifnull(g.qty,0) + ifnull( vf.qty, 0 ))+ gp.safety_stock 
      )< 0,
    0,(
      round((gp.max -(
      ifnull(g.qty,0) + ifnull( vf.qty, 0 ))+ gp.safety_stock 
    )/bg.pack_qty)*bg.pack_qty)),0) AS recommend_fill_qty,
    ifnull( vf.qty, 0 ) AS reserve_qty ,
    q.qty as total,
    wr.qty as req_qty
  FROM
  h_node_drugs as ns 
  left JOIN b_generic_plannings AS gp ON ns.hospital_id = gp.hospital_id
  AND ns.hospital_id = gp.hospital_id
  left join wm_generics AS g on g.hospital_id = ns.hospital_id and g.generic_id = gp.generic_id
    left JOIN b_generics AS bg ON bg.id = gp.generic_id  and  bg.type = 'DRUG'
    left JOIN b_hospitals AS bh ON bh.id = ns.hospital_id
    LEFT JOIN view_fulfill_reserves AS vf ON vf.generic_id = gp.generic_id 	AND vf.hospital_id = ns.hospital_id 
    left join (
    select hospital_id,generic_id,sum(fdi.qty) as qty from wm_fulfill_drugs as f 
    join wm_fulfill_drug_details as fd on f.id = fd.fulfill_drug_id
  join wm_fulfill_drug_detail_items as fdi on fd.id = fdi.fulfill_drug_detail_id
  where f.is_approved='Y'
  group by hospital_id,generic_id
  ) as q on q.hospital_id = ns.hospital_id and  q.generic_id = gp.generic_id 
  left join (
    select r.hospital_id_node as hospital_id,rd.generic_id,sum(rd.qty) as qty from wm_requisitions as r
    join wm_requisition_details as rd on r.id = rd.requisition_id
  where r.is_approved = 'Y'
  group by hospital_id_node,generic_id
  ) as wr on wr.hospital_id = ns.hospital_id and  wr.generic_id = gp.generic_id ) as a
    group by hospital_id `;
    if (orderType == 'ZONE') {
      sql += `order by a.zone_code ${orderSort}`;
    } else if (orderType == 'PROVINCE') {
      sql += `order by a.zone_code ${orderSort}`;
    }

    return db.raw(sql);
  }

  getProductsSupplies(db: Knex, orderType = null, orderSort = null) {
    let sql = `SELECT
    a.hospital_id,
    a.hospital_name,
    a.zone_code,
    sum(
    IF
    ( a.generic_id = 9, a.qty, 0 )) AS surgical_gown_qty,
    sum(
    IF
    ( a.generic_id = 9, a.min, 0 )) AS surgical_gown_min_qty,
      sum(
    IF
    ( a.generic_id = 9, a.max, 0 )) AS  surgical_gown_max_qty,
        sum(
    IF
    ( a.generic_id = 9, a.safety_stock, 0 )) AS  surgical_gown_safety_qty,
          sum(
    IF
    ( a.generic_id = 9, a.recommend_fill_qty, 0 )) AS  surgical_gown_recomment_qty,
            sum(
    IF
    ( a.generic_id = 9, a.reserve_qty, 0 )) AS  surgical_gown_reserve_qty,
              sum(
    IF
    ( a.generic_id = 9, a.total, 0 )) AS  surgical_gown_total_qty,
    sum(
      IF
      ( a.generic_id = 9, a.req_qty, 0 )) AS  surgical_gown_req_qty,
    
      group_concat(IF
      ( a.generic_id = 9, a.req_id, null )) AS  surgical_gown_req_id,
      
    sum(
    IF
    ( a.generic_id = 10, a.qty, 0 )) AS cover_all1_qty,
    sum(
    IF
    ( a.generic_id = 10, a.min, 0 )) AS cover_all1_min_qty,
      sum(
    IF
    ( a.generic_id = 10, a.max, 0 )) AS cover_all1_max_qty,
        sum(
    IF
    ( a.generic_id = 10, a.safety_stock, 0 )) AS cover_all1_safety_qty,
          sum(
    IF
    ( a.generic_id = 10, a.recommend_fill_qty, 0 )) AS cover_all1_recomment_qty,
            sum(
    IF
    ( a.generic_id = 10, a.reserve_qty, 0 )) AS cover_all1_reserve_qty,
              sum(
    IF
    ( a.generic_id = 10, a.total, 0 )) AS cover_all1_total_qty,
    sum(
      IF
      ( a.generic_id = 10, a.req_qty, 0 )) AS  cover_all1_req_qty,
    
      group_concat(IF
      ( a.generic_id = 10, a.req_id, null )) AS  cover_all1_req_id,
    
    sum(
    IF
    ( a.generic_id = 11, a.qty, 0 )) AS cover_all2_qty,
    sum(
    IF
    ( a.generic_id = 11, a.min, 0 )) AS cover_all2_min_qty,
      sum(
    IF
    ( a.generic_id = 11, a.max, 0 )) AS cover_all2_max_qty,
        sum(
    IF
    ( a.generic_id = 11, a.safety_stock, 0 )) AS cover_all2_safety_qty,
          sum(
    IF
    ( a.generic_id = 11, a.recommend_fill_qty, 0 )) AS cover_all2_recomment_qty,
            sum(
    IF
    ( a.generic_id = 11, a.reserve_qty, 0 )) AS cover_all2_reserve_qty,
            sum(
    IF
    ( a.generic_id = 11, a.total, 0 )) AS cover_all2_total_qty,	
    sum(
      IF
      ( a.generic_id = 11, a.req_qty, 0 )) AS  cover_all2_req_qty,
    
      group_concat(IF
      ( a.generic_id = 11, a.req_id, null )) AS  cover_all2_req_id,
    
    sum(
    IF
    ( a.generic_id = 12, a.qty, 0 )) AS n95_qty,
    sum(
    IF
    ( a.generic_id = 12, a.min, 0 )) AS n95_min_qty,
      sum(
    IF
    ( a.generic_id = 12, a.max, 0 )) AS n95_max_qty,
        sum(
    IF
    ( a.generic_id = 12, a.safety_stock, 0 )) AS n95_safety_qty,
          sum(
    IF
    ( a.generic_id = 12, a.recommend_fill_qty, 0 )) AS n95_recomment_qty,
            sum(
    IF
    ( a.generic_id = 12, a.reserve_qty, 0 )) AS n95_reserve_qty,					sum(
    IF
    ( a.generic_id = 12, a.total, 0 )) AS n95_total_qty,
    sum(
      IF
      ( a.generic_id = 12, a.req_qty, 0 )) AS  n95_req_qty,
    
      group_concat( IF
      ( a.generic_id = 12, a.req_id, null )) AS  n95_req_id,
    
    
    sum(
    IF
    ( a.generic_id = 13, a.qty, 0 )) AS shoe_cover_qty,
    sum(
    IF
    ( a.generic_id = 13, a.min, 0 )) AS shoe_cover_min_qty,
      sum(
    IF
    ( a.generic_id = 13, a.max, 0 )) AS shoe_cover_max_qty,
        sum(
    IF
    ( a.generic_id = 13, a.safety_stock, 0 )) AS shoe_cover_safety_qty,
          sum(
    IF
    ( a.generic_id = 13, a.recommend_fill_qty, 0 )) AS shoe_cover_recomment_qty,
            sum(
    IF
    ( a.generic_id = 13, a.reserve_qty, 0 )) AS shoe_cover_reserve_qty,
            sum(
    IF
    ( a.generic_id = 13, a.total, 0 )) AS shoe_cover_total_qty,	
    sum(
      IF
      ( a.generic_id = 13, a.req_qty, 0 )) AS  shoe_cover_req_qty,
    
      group_concat(IF
      ( a.generic_id = 13, a.req_id, null )) AS  shoe_cover_req_id,

    
    sum(
    IF
    ( a.generic_id = 14, a.qty, 0 )) AS surgical_hood_qty,
    sum(
    IF
    ( a.generic_id = 14, a.min, 0 )) AS surgical_hood_min_qty,
      sum(
    IF
    ( a.generic_id = 14, a.max, 0 )) AS surgical_hood_max_qty,
        sum(
    IF
    ( a.generic_id = 14, a.safety_stock, 0 )) AS surgical_hood_safety_qty,
          sum(
    IF
    ( a.generic_id = 14, a.recommend_fill_qty, 0 )) AS surgical_hood_recomment_qty,
            sum(
    IF
    ( a.generic_id = 14, a.reserve_qty, 0 )) AS surgical_hood_reserve_qty,
              sum(
    IF
    ( a.generic_id = 14, a.total, 0 )) AS surgical_hood_total_qty,
    sum(
      IF
      ( a.generic_id = 14, a.req_qty, 0 )) AS  surgical_hood_req_qty,
    
      group_concat(IF
      ( a.generic_id = 14, a.req_id, null )) AS  surgical_hood_req_id,
    
    sum(
    IF
    ( a.generic_id = 15, a.qty, 0 )) AS long_glove_qty,
    sum(
    IF
    ( a.generic_id = 15, a.min, 0 )) AS long_glove_min_qty,
      sum(
    IF
    ( a.generic_id = 15, a.max, 0 )) AS long_glove_max_qty,
        sum(
    IF
    ( a.generic_id = 15, a.safety_stock, 0 )) AS long_glove_safety_qty,
          sum(
    IF
    ( a.generic_id = 15, a.recommend_fill_qty, 0 )) AS long_glove_recomment_qty,
            sum(
    IF
    ( a.generic_id = 15, a.reserve_qty, 0 )) AS long_glove_reserve_qty,
              sum(
    IF
    ( a.generic_id = 15, a.total, 0 )) AS long_glove_total_qty,
    sum(
      IF
      ( a.generic_id = 15, a.req_qty, 0 )) AS  long_glove_req_qty,
    
      group_concat(IF
      ( a.generic_id = 15, a.req_id, null )) AS  long_glove_req_id,
      
          
    sum(
        IF
        ( a.generic_id = 16, a.qty, 0 )) AS face_shield_qty,
        sum(
        IF
        ( a.generic_id = 16, a.min, 0 )) AS face_shield_min_qty,
          sum(
        IF
        ( a.generic_id = 16, a.max, 0 )) AS face_shield_max_qty,
            sum(
        IF
        ( a.generic_id = 16, a.safety_stock, 0 )) AS face_shield_safety_qty,
              sum(
        IF
        ( a.generic_id = 16, a.recommend_fill_qty, 0 )) AS face_shield_recomment_qty,
                sum(
        IF
        ( a.generic_id = 16, a.reserve_qty, 0 )) AS face_shield_reserve_qty,
                  sum(
        IF
        ( a.generic_id = 16, a.total, 0 )) AS face_shield_total_qty,
        sum(
          IF
          ( a.generic_id = 16, a.req_qty, 0 )) AS  face_shield_req_qty,
        
          group_concat(IF
          ( a.generic_id = 16, a.req_id, null )) AS  face_shield_req_id,

          sum(
            IF
            ( a.generic_id = 17, a.qty, 0 )) AS surgical_mask_qty,
            sum(
            IF
            ( a.generic_id = 17, a.min, 0 )) AS surgical_mask_min_qty,
              sum(
            IF
            ( a.generic_id = 17, a.max, 0 )) AS surgical_mask_max_qty,
                sum(
            IF
            ( a.generic_id = 17, a.safety_stock, 0 )) AS surgical_mask_safety_qty,
                  sum(
            IF
            ( a.generic_id = 17, a.recommend_fill_qty, 0 )) AS surgical_mask_recomment_qty,
                    sum(
            IF
            ( a.generic_id = 17, a.reserve_qty, 0 )) AS surgical_mask_reserve_qty,
                      sum(
            IF
            ( a.generic_id = 17, a.total, 0 )) AS surgical_mask_total_qty,
            sum(
              IF
              ( a.generic_id = 17, a.req_qty, 0 )) AS  surgical_mask_req_qty,
            
              group_concat(IF
              ( a.generic_id = 17, a.req_id, null )) AS  surgical_mask_req_id
      
  FROM
    (
      SELECT
      ns.hospital_id,
      bh.hospname AS hospital_name,
      bh.zone_code,
      gp.generic_id,
      bg.name AS generic_name,
      g.qty,
      gp.min,
      gp.max,
      gp.safety_stock,
      if((( ifnull( wr.qty, 0 )/ bg.pack_qty )* bg.pack_qty)<0,0,
      round(( ifnull( wr.qty, 0 )/ bg.pack_qty )* bg.pack_qty )) AS recommend_fill_qty,
      ifnull( vf.qty, 0 ) AS reserve_qty ,
      q.qty as total,
      wr.qty as req_qty,
      wr.id as req_id
    FROM
    h_node_supplies as ns 
    left JOIN b_generic_plannings AS gp ON ns.hospital_id = gp.hospital_id
    
    left join wm_generics AS g on g.hospital_id = ns.hospital_id and g.generic_id = gp.generic_id
      left JOIN b_generics AS bg ON bg.id = gp.generic_id and  bg.type = 'SUPPLIES'
      LEFT JOIN view_fulfill_reserves AS vf ON vf.generic_id = gp.generic_id 	AND vf.hospital_id = gp.hospital_id 
      left join (
      select hospital_id,generic_id,sum(fdi.qty) as qty from wm_fulfill_supplies as f 
      join wm_fulfill_supplies_details as fd on f.id = fd.fulfill_supplies_id
    join wm_fulfill_supplies_detail_items as fdi on fd.id = fdi.fulfill_supplies_detail_id
    where f.is_approved='Y'
    group by hospital_id,generic_id
    ) as q on q.hospital_id = gp.hospital_id and  q.generic_id = gp.generic_id 
    left join (
      select GROUP_CONCAT(rd.id) as id,r.hospital_id_node as hospital_id,rd.generic_id,sum(rd.qty) as qty from wm_requisitions as r
      join wm_requisition_details as rd on r.id = rd.requisition_id
    where rd.is_fulfill = 'N'
    group by hospital_id_node,generic_id
    ) as wr on wr.hospital_id = gp.hospital_id and  wr.generic_id = gp.generic_id 
    left JOIN b_hospitals AS bh ON bh.id = gp.hospital_id
) as a
    group by hospital_id `;
    if (orderType == 'ZONE') {
      sql += `order by a.zone_code ${orderSort}`;
    } else if (orderType == 'PROVINCE') {
      sql += `order by a.zone_code ${orderSort}`;
    }

    return db.raw(sql);
  }

  getProductByIds(db: Knex, type, orderType = null, orderSort = null, ids) {
    let sql = `SELECT
    a.hospital_id,
    a.hospital_code,
    a.province_name,
    a.hospital_name,
    a.zone_code,
    sum(
    IF
    ( a.generic_id = 1, a.qty, 0 )) AS hydroxy_chloroquine_qty,
    sum(
    IF
    ( a.generic_id = 1, a.min, 0 )) AS hydroxy_chloroquine_min_qty,
      sum(
    IF
    ( a.generic_id = 1, a.max, 0 )) AS  hydroxy_chloroquine_max_qty,
        sum(
    IF
    ( a.generic_id = 1, a.safety_stock, 0 )) AS  hydroxy_chloroquine_safety_qty,
          sum(
    IF
    ( a.generic_id = 1, a.recommend_fill_qty, 0 )) AS  hydroxy_chloroquine_recomment_qty,
            sum(
    IF
    ( a.generic_id = 1, a.reserve_qty, 0 )) AS  hydroxy_chloroquine_reserve_qty,
              sum(
    IF
    ( a.generic_id = 1, a.total, 0 )) AS  hydroxy_chloroquine_total_qty,
    sum(
      IF
      ( a.generic_id = 1, a.req_qty, 0 )) AS  hydroxy_chloroquine_req_qty,
      
    sum(
    IF
    ( a.generic_id = 2, a.qty, 0 )) AS chloroquine_qty,
    sum(
    IF
    ( a.generic_id = 2, a.min, 0 )) AS chloroquine_min_qty,
      sum(
    IF
    ( a.generic_id = 2, a.max, 0 )) AS chloroquine_max_qty,
        sum(
    IF
    ( a.generic_id = 2, a.safety_stock, 0 )) AS chloroquine_safety_qty,
          sum(
    IF
    ( a.generic_id = 2, a.recommend_fill_qty, 0 )) AS chloroquine_recomment_qty,
            sum(
    IF
    ( a.generic_id = 2, a.reserve_qty, 0 )) AS chloroquine_reserve_qty,
              sum(
    IF
    ( a.generic_id = 2, a.total, 0 )) AS chloroquine_total_qty,
    sum(
      IF
      ( a.generic_id = 2, a.req_qty, 0 )) AS  chloroquine_req_qty,
    
    sum(
    IF
    ( a.generic_id = 3, a.qty, 0 )) AS darunavir_qty,
    sum(
    IF
    ( a.generic_id = 3, a.min, 0 )) AS darunavir_min_qty,
      sum(
    IF
    ( a.generic_id = 3, a.max, 0 )) AS darunavir_max_qty,
        sum(
    IF
    ( a.generic_id = 3, a.safety_stock, 0 )) AS darunavir_safety_qty,
          sum(
    IF
    ( a.generic_id = 3, a.recommend_fill_qty, 0 )) AS darunavir_recomment_qty,
            sum(
    IF
    ( a.generic_id = 3, a.reserve_qty, 0 )) AS darunavir_reserve_qty,
            sum(
    IF
    ( a.generic_id = 3, a.total, 0 )) AS darunavir_total_qty,	
    sum(
      IF
      ( a.generic_id = 3, a.req_qty, 0 )) AS  darunavir_req_qty,
    
    sum(
    IF
    ( a.generic_id = 4, a.qty, 0 )) AS lopinavir_qty,
    sum(
    IF
    ( a.generic_id = 4, a.min, 0 )) AS lopinavir_min_qty,
      sum(
    IF
    ( a.generic_id = 4, a.max, 0 )) AS lopinavir_max_qty,
        sum(
    IF
    ( a.generic_id = 4, a.safety_stock, 0 )) AS lopinavir_safety_qty,
          sum(
    IF
    ( a.generic_id = 4, a.recommend_fill_qty, 0 )) AS lopinavir_recomment_qty,
            sum(
    IF
    ( a.generic_id = 4, a.reserve_qty, 0 )) AS lopinavir_reserve_qty,					sum(
    IF
    ( a.generic_id = 4, a.total, 0 )) AS lopinavir_total_qty,
    sum(
      IF
      ( a.generic_id = 4, a.req_qty, 0 )) AS  lopinavir_req_qty,
    
    
    sum(
    IF
    ( a.generic_id = 5, a.qty, 0 )) AS ritonavir_qty,
    sum(
    IF
    ( a.generic_id = 5, a.min, 0 )) AS ritonavir_min_qty,
      sum(
    IF
    ( a.generic_id = 5, a.max, 0 )) AS ritonavir_max_qty,
        sum(
    IF
    ( a.generic_id = 5, a.safety_stock, 0 )) AS ritonavir_safety_qty,
          sum(
    IF
    ( a.generic_id = 5, a.recommend_fill_qty, 0 )) AS ritonavir_recomment_qty,
            sum(
    IF
    ( a.generic_id = 5, a.reserve_qty, 0 )) AS ritonavir_reserve_qty,
            sum(
    IF
    ( a.generic_id = 5, a.total, 0 )) AS ritonavir_total_qty,	
    sum(
      IF
      ( a.generic_id = 5, a.req_qty, 0 )) AS  ritonavir_req_qty,

    
    sum(
    IF
    ( a.generic_id = 7, a.qty, 0 )) AS azithromycin_qty,
    sum(
    IF
    ( a.generic_id = 7, a.min, 0 )) AS azithromycin_min_qty,
      sum(
    IF
    ( a.generic_id = 7, a.max, 0 )) AS azithromycin_max_qty,
        sum(
    IF
    ( a.generic_id = 7, a.safety_stock, 0 )) AS azithromycin_safety_qty,
          sum(
    IF
    ( a.generic_id = 7, a.recommend_fill_qty, 0 )) AS azithromycin_recomment_qty,
            sum(
    IF
    ( a.generic_id = 7, a.reserve_qty, 0 )) AS azithromycin_reserve_qty,
              sum(
    IF
    ( a.generic_id = 7, a.total, 0 )) AS azithromycin_total_qty,
    sum(
      IF
      ( a.generic_id = 7, a.req_qty, 0 )) AS  azithromycin_req_qty
  FROM
    (
  SELECT
    g.generic_id,
    bg.name AS generic_name,
    g.hospital_id,
    bh.province_name,
    bh.hospcode AS hospital_code,
    bh.hospname AS hospital_name,
    bh.zone_code,
    g.qty,
    gp.min,
    gp.max,
    gp.safety_stock,
  IF
  ((
      gp.max -(
      g.qty + ifnull( vf.qty, 0 ))+ gp.safety_stock 
      )< 0,
    0,(
      round((gp.max -(
      g.qty + ifnull( vf.qty, 0 ))+ gp.safety_stock 
    )/bg.pack_qty)*bg.pack_qty)) AS recommend_fill_qty,
    ifnull( vf.qty, 0 ) AS reserve_qty ,
    q.qty as total,
    wr.qty as req_qty
  FROM
    wm_generics AS g
    INNER JOIN b_generic_plannings AS gp ON g.generic_id = gp.generic_id 
    AND g.hospital_id = gp.hospital_id
    INNER JOIN b_generics AS bg ON bg.id = g.generic_id
    INNER JOIN b_hospitals AS bh ON bh.id = g.hospital_id
    LEFT JOIN view_fulfill_reserves AS vf ON vf.generic_id = g.generic_id 	AND vf.hospital_id = g.hospital_id 
    left join (
    select hospital_id,generic_id,sum(fdi.qty) as qty from wm_fulfill_drugs as f 
    join wm_fulfill_drug_details as fd on f.id = fd.fulfill_drug_id
  join wm_fulfill_drug_detail_items as fdi on fd.id = fdi.fulfill_drug_detail_id
  where f.is_approved='Y' and f.id in (${ids})
  group by hospital_id,generic_id
  ) as q on q.hospital_id = g.hospital_id and  q.generic_id = g.generic_id 
  left join (
    select r.hospital_id_node as hospital_id,rd.generic_id,sum(rd.qty) as qty from wm_requisitions as r
    join wm_requisition_details as rd on r.id = rd.requisition_id
  where r.is_approved = 'Y'
  group by hospital_id_node,generic_id
  ) as wr on wr.hospital_id = g.hospital_id and  wr.generic_id = g.generic_id 

  WHERE
    bg.type = 'DRUG' ) as a
    group by hospital_id `;
    if (orderType == 'ZONE') {
      sql += `order by a.zone_code ${orderSort}`;
    } else if (orderType == 'PROVINCE') {
      sql += `order by a.zone_code ${orderSort}`;
    }

    return db.raw(sql);
  }

  getListSurgicalMasks(db: Knex) {
    return db('wm_fulfill_surgical_masks')
      .orderBy('id', 'DESC')
  }

  getDetailSurgicalMasks(db: Knex, id: any) {
    return db('wm_fulfill_surgical_mask_details as md')
      .select('h.hospname', 'mdi.qty', 'g.name as generic_name', 'u.name as unit_name')
      .join('wm_fulfill_surgical_mask_detail_items as mdi', 'mdi.fulfill_surgical_mask_detail_id', 'md.id')
      .join('b_generics as g', 'g.id', 'mdi.generic_id')
      .join('b_units as u', 'u.id', 'g.unit_id')
      .join('b_hospitals as h', 'h.id', 'md.hospital_id')
      .where('md.fulfill_surgical_mask_id', id)
      .where(db.raw('mdi.qty > 0'))
  }

  getFulFillDrugs(db: Knex) {
    return db('wm_fulfill_drugs as fd')
      .select('fd.*', 'u.fname', 'u.lname')
      .join('um_users as u', 'u.id', 'fd.created_by')
      .orderBy('id', 'DESC')
  }

  getFulFillSupplies(db: Knex) {
    return db('wm_fulfill_supplies as fd')
      .select('fd.*', 'u.fname', 'u.lname')
      .join('um_users as u', 'u.id', 'fd.created_by')
      .orderBy('id', 'DESC')
  }

  getFulFillSuppliesUnpaid(db: Knex) {
    return db('wm_fulfill_supplies_unpaids as fd')
      .select('fd.*', 'u.fname', 'u.lname')
      .join('um_users as u', 'u.id', 'fd.created_by')
      .orderBy('id', 'DESC')
  }

  getFulFillDrugDetailItems(db: Knex, ids) {
    let sql = db('wm_fulfill_drug_details as fdd')
      .join('wm_fulfill_drug_detail_items as fddi', 'fddi.fulfill_drug_detail_id', 'fdd.id')
      .join('wm_fulfill_drugs as fd', 'fd.id', 'fdd.fulfill_drug_id')
      .where('fd.is_approved', 'N')
      .whereIn('fdd.fulfill_drug_id', ids);
    console.log(sql.toString());
    return sql
  }

  getFulFillSuppliesDetailItems(db: Knex, ids) {
    return db('wm_fulfill_supplies_details as fdd')
      .join('wm_fulfill_supplies_detail_items as fddi', 'fddi.fulfill_supplies_detail_id', 'fdd.id')
      .join('wm_fulfill_supplies as fd', 'fd.id', 'fdd.fulfill_supplies_id')
      .where('fd.is_approved', 'N')
      .whereIn('fdd.fulfill_supplies_id', ids);

  }

  approvedDrugs(db: Knex, data, userId) {
    return db('wm_fulfill_drugs as fd')
      .update({
        'is_approved': 'Y',
        'approved_by': userId,
        'approved_date': db.raw('now()')
      })
      .whereIn('id', data);
  }
  approvedSupplies(db: Knex, data, userId) {
    return db('wm_fulfill_supplies as fd')
      .update({
        'is_approved': 'Y',
        'approved_by': userId,
        'approved_date': db.raw('now()')
      })
      .whereIn('id', data);
  }

  getHospNode(db: Knex) {
    return db('h_node_drugs AS n')
      .select('n.*', 'h.hospcode', 'h.hospname')
      .join('b_hospitals AS h', 'h.id', 'n.hospital_id')
  }

  // getBalance(db:Knex,hospitalId){
  //   return db('b_generics as g')
  //   .leftJoin('wm_generics as v','v.generic_id','g.id')
  //   .where('g.type','DRUG')
  //   .where('g.sub_type','COVID')
  //   .where('v.hospital_id',hospitalId)
  // }

  getBalance(db: Knex, hospitalId) {
    let sql = db('wm_generics as g')
      .select('g.generic_id', 'bg.name as generic_name', 'g.hospital_id', 'bh.hospname as hospital_name', 'g.qty', 'gp.min', 'gp.max',
        'gp.safety_stock', db.raw('if((gp.max-(g.qty+ifnull(vf.qty,0))+gp.safety_stock)<0,0,(gp.max-(g.qty+ifnull(vf.qty,0))+gp.safety_stock)) as fill_qty'),
        db.raw('if((gp.max-(g.qty+ifnull(vf.qty,0))+gp.safety_stock)<0,0,(gp.max-(g.qty+ifnull(vf.qty,0))+gp.safety_stock)) as recommend_fill_qty'),
        db.raw('((g.qty+ifnull(vf.qty,0))*100/gp.max) as qty_order'), db.raw(`ifnull(vf.qty,0) as reserve_qty`))
      .join('b_generic_plannings as gp', (v) => {
        v.on('g.generic_id', 'gp.generic_id');
        v.on('g.hospital_id', 'gp.hospital_id');
      })
      .join('b_generics as bg', 'bg.id', 'g.generic_id')
      .join('b_hospitals as bh', 'bh.id', 'g.hospital_id')
      .leftJoin('view_fulfill_reserves as vf', (v) => {
        v.on('vf.generic_id', 'g.generic_id')
        v.on('vf.hospital_id', 'g.hospital_id')
      })
      .where('bg.type', 'DRUG')
      .where('g.hospital_id', hospitalId)
    // .orderByRaw('(g.qty+ifnull(vf.qty,0))*100/gp.max')
    // .havingRaw('fill_qty > 0 and (qty+reserve_qty) < min')
    console.log(sql.toString());
    return sql;
  }

  getHospital(db: Knex, hospitalTypeCode) {
    return db('views_supplies_hospitals AS v')
      .select('v.*', 'h.hospname', 'h.hospcode', 'h.province_name',
        db.raw(`(( ( - 1 * DATEDIFF( s.date, now( ) ) ) * IFNULL( v.month_usage_qty, 0 ) ) + v.qty) - IFNULL( v.month_usage_qty / 4, 0 ) as week1`),
        db.raw(`(( ( - 1 * DATEDIFF( s.date, now( ) ) ) * IFNULL( v.month_usage_qty, 0 ) ) + v.qty) - IFNULL( v.month_usage_qty / 4, 0 ) * 2 as week2`),
        db.raw(`(( ( - 1 * DATEDIFF( s.date, now( ) ) ) * IFNULL( v.month_usage_qty, 0 ) ) + v.qty) - IFNULL( v.month_usage_qty / 4, 0 ) * 3 as week3`),
        db.raw(`(( ( - 1 * DATEDIFF( s.date, now( ) ) ) * IFNULL( v.month_usage_qty, 0 ) ) + v.qty) - IFNULL( v.month_usage_qty / 4, 0 ) * 4 as week4`),
        db.raw(`( ( - 1 * DATEDIFF( s.date, now( ) ) ) * v.month_usage_qty ) + v.qty AS datecal`))
      .join('b_hospitals AS h', 'h.id', 'v.hospital_id')
      .join('wm_supplies AS s', 's.id', 'v.wm_supplie_id')
      .whereIn('h.hosptype_code', hospitalTypeCode)
      .where('v.generic_id', 17)
      .whereNotNull('v.qty')
      .having(db.raw('week1 < 0'))
      .orderBy('h.hosptype_code', 'h.province_name');
  }

  getDrugMinMax(db: Knex, hospitalId) {
    return db('b_generics AS bg')
      .select('bg.id as generic_id', 'bgp.max', 'bgp.min', 'bgp.safety_stock', 'bgp.hospital_id', 'bg.name as generic_name', 'bu.name as unit_name')
      .joinRaw(`LEFT JOIN b_generic_plannings AS bgp ON bgp.generic_id = bg.id AND bgp.hospital_id = ?`, hospitalId)
      .join('b_units AS bu', 'bu.id', 'bg.unit_id')
      .where('bg.type', 'DRUG')
      .where('bg.is_actived', 'Y')
  }

  removeMinMax(db: Knex, hospId) {
    return db('b_generic_plannings')
      .delete().where('hospital_id', hospId)
  }

  saveMinMax(db: Knex, data) {
    return db('b_generic_plannings')
      .insert(data)
  }

  saveFulFillDrug(db: Knex, data) {
    return db('wm_fulfill_drugs')
      .insert(data);
  }

  saveFulFillDrugDetail(db: Knex, data) {
    return db('wm_fulfill_drug_details')
      .insert(data);
  }
  saveFulFillDrugDetailItem(db: Knex, data) {
    return db('wm_fulfill_drug_detail_items')
      .insert(data);
  }

  drugSumDetails(db: Knex, id) {
    return db('wm_fulfill_drugs AS wf')
      .sum('wfdd.qty as qty')
      .select('bg.name as generic_name', 'bu.name as unit_name')
      .join('wm_fulfill_drug_details AS wfd', 'wfd.fulfill_drug_id', 'wf.id')
      .join('wm_fulfill_drug_detail_items AS wfdd', 'wfdd.fulfill_drug_detail_id', 'wfd.id')
      .join('b_generics as bg', 'bg.id', 'wfdd.generic_id')
      .join('b_units as bu', 'bu.id', 'bg.unit_id')
      .where('wf.id', id)
      .groupBy('wfdd.generic_id')
  }

  suppliesSumDetails(db: Knex, id) {
    return db('wm_fulfill_supplies AS wfs')
      .sum('wfsdi.qty as qty')
      .select('bg.name as generic_name', 'bu.name as unit_name')
      .join('wm_fulfill_supplies_details AS wfsd', 'wfsd.fulfill_supplies_id', 'wfs.id')
      .join('wm_fulfill_supplies_detail_items AS wfsdi', 'wfsdi.fulfill_supplies_detail_id', 'wfsd.id')
      .join('b_generics AS bg', 'bg.id', 'wfsdi.generic_id')
      .join('b_units as bu', 'bu.id', 'bg.unit_id')
      .where('wfs.id', id)
      .groupBy('wfsdi.generic_id')
  }
  saveFulFillSupplies(db: Knex, data) {
    return db('wm_fulfill_supplies')
      .insert(data);
  }

  saveFulFillSuppliesDetail(db: Knex, data) {
    return db('wm_fulfill_supplies_details')
      .insert(data);
  }

  removeFulFillSuppliesDetail(db: Knex, id) {
    return db('wm_fulfill_supplies_details')
      .where('id', id)
      .delete();
  }

  saveFulFillSuppliesDetailItem(db: Knex, data) {
    return db('wm_fulfill_supplies_detail_items')
      .insert(data);
  }

  saveQTY(db: Knex, data) {
    let sqls = [];
    data.forEach(v => {
      let sql = `
          INSERT INTO wm_generics
          (hospital_id, generic_id,qty)
          VALUES('${v.hospital_id}', '${v.generic_id}',${v.qty})
          ON DUPLICATE KEY UPDATE
          qty=qty+${v.qty}
        `;
      sqls.push(sql);
    });
    let queries = sqls.join(';');
    return db.raw(queries);
  }

  getFulFillDrugItems(db: Knex, drug, ids) {
    let sql = db('wm_fulfill_drug_details as fdd')
      .select('h.hospname')
      .join('wm_fulfill_drug_detail_items as fddi', 'fddi.fulfill_drug_detail_id', 'fdd.id')
      .join('wm_fulfill_drugs as fd', 'fd.id', 'fdd.fulfill_drug_id')
      .join('b_hospitals as h', 'h.id', 'fdd.hospital_id')
      .where('fd.is_approved', 'N')
      .whereIn('fdd.fulfill_drug_id', ids)
      .groupBy('h.id');

    for (const items of drug) {
      sql.select(db.raw(`sum(case when fddi.generic_id = ? then fddi.qty else 0 end) as ?`, [items.id, items.name]))
    }
    return sql
  }

  saveHeadSurgicalMask(db: Knex, data: any) {
    return db('wm_fulfill_surgical_masks').insert(data);
  }

  delHeadSurgicalMask(db: Knex, id: any) {
    return db('wm_fulfill_surgical_masks').del().where('id', id);
  }

  saveDetailSurgicalMask(db: Knex, data: any) {
    return db('wm_fulfill_surgical_mask_details').insert(data);
  }

  saveItemSurgicalMask(db: Knex, data: any) {
    return db('wm_fulfill_surgical_mask_detail_items').insert(data);
  }

  saveWmGenerics(db: Knex, data: any) {
    return db('wm_generics').insert(data);
  }

  getSumGenericsFromFulfill(db: Knex, sId) {
    return db('wm_fulfill_surgical_mask_details as rd')
      .select('rdi.generic_id', 'rd.hospcode')
      .sum('rdi.qty as qty')
      .join('wm_fulfill_surgical_mask_detail_items as rdi', 'rd.id', 'rdi.fulfill_surgical_mask_detail_id')
      .join('b_generics as s', 's.id', 'rdi.generic_id')
      .where('rd.fulfill_surgical_mask_id', sId)
      .groupBy('generic_id')
  }

  getFulfillDetails(db: Knex, sId) {
    return db('wm_fulfill_surgical_mask_details as rd')
      .select('rd.id as fulfill_surgical_mask_detail_id', 's.hospcode', db.raw('CONCAT(r.code,s.hospcode) as con_no'))
      .join('b_hospitals as s', 'rd.hospital_id', 's.id')
      .join('wm_fulfill_surgical_masks as r', 'r.id', 'rd.fulfill_surgical_mask_id')
      .where('rd.fulfill_surgical_mask_id', sId)
  }

  getFulFillSupplesItems(db: Knex, supplies, ids) {
    let sql = db('wm_fulfill_supplies_details as fdd')
      .select('h.hospname')
      .join('wm_fulfill_supplies_detail_items as fddi', 'fddi.fulfill_supplies_detail_id', 'fdd.id')
      .join('wm_fulfill_supplies as fd', 'fd.id', 'fdd.fulfill_supplies_id')
      .join('b_hospitals as h', 'h.id', 'fdd.hospital_id')
      .where('fd.is_approved', 'N')
      .whereIn('fdd.fulfill_supplies_id', ids)
      .groupBy('h.id');

    for (const items of supplies) {
      sql.select(db.raw(`sum(case when fddi.generic_id = ? then fddi.qty else 0 end) as ?`, [items.id, items.name]))
    }
    return sql
  }

  updateRequisitionDetailFulfill(db: Knex, ids) {
    return db('wm_requisition_details')
      .update('is_fulfill', 'Y')
      .whereIn('id', ids)
  }

  saveUnpaid(db: Knex, data) {
    return db('wm_fulfill_supplies_unpaids')
      .insert(data, 'id');
  }

  saveUnpaidDetails(db: Knex, data) {
    return db('wm_fulfill_supplies_unpaid_details')
      .insert(data, 'id');
  }

  saveUnpaidDetailItems(db: Knex, data) {
    return db('wm_fulfill_supplies_unpaid_detail_items')
      .insert(data, 'id');
  }

  getGPO() {
    return new Promise((resolve, reject) => {
      var options = {
        'method': 'POST',
        'url': 'http://svmi.gpo.or.th/SVMIService.asmx/GetStockCOVID19?Userkey=XXXStockCOVID19XXX',
        'headers': {
          'Content-Type': ['text/plain', 'text/plain']
        },
        body: "{UserKey : \"XXXStockCOVID19XXX\" }"

      };
      request(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }

}