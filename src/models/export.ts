import * as Knex from 'knex';

export class ExportModel {

  getRequisitionQty(db: Knex, startDate, endDate) {
    return db.raw(`SELECT
      r.hospital_id_node,
      h.hospcode,
      h.hospname,
      h.province_name,
      h.zone_code,
      SUM( IF ( ( g.id = 9 ), rd.qty, 0 ) ) AS surgical_gown,
      SUM( IF ( ( g.id = 10 ), rd.qty, 0 ) ) AS cover_all1,
      SUM( IF ( ( g.id = 11 ), rd.qty, 0 ) ) AS cover_all2,
      SUM( IF ( ( g.id = 12 ), rd.qty, 0 ) ) AS n95,
      SUM( IF ( ( g.id = 13 ), rd.qty, 0 ) ) AS shoe_cover,
      SUM( IF ( ( g.id = 14 ), rd.qty, 0 ) ) AS surgical_hood 
    FROM
      wm_requisitions r
      JOIN wm_requisition_details rd ON rd.requisition_id = r.id
      JOIN b_hospitals h ON h.id = r.hospital_id_node
      JOIN b_generics g ON g.id = rd.generic_id 
    WHERE
      r.create_date BETWEEN ?
      AND ?
    GROUP BY
      r.hospital_id_node
      ORDER BY h.zone_code`, [startDate, endDate])
  }

  getPUIperson(db: Knex, startDate, endDate) {
    return db.raw(`
      SELECT * FROM (
      SELECT
        r.hospital_id_node,
        COUNT( * ) AS qty 
      FROM
        p_covid_case_details p
        JOIN p_covid_cases pc ON pc.id = p.covid_case_id
        JOIN p_patients pp ON pp.id = pc.patient_id
        LEFT JOIN wm_requisitions r ON r.hospital_id_node = pp.hospital_id 
        AND r.covid_case_detail_id = p.id 
      WHERE
        p.entry_date BETWEEN ?
        AND ?
        AND p.gcs_id = 5 
        AND p.status = 'ADMIT' 
      GROUP BY
        pp.id
        ) AS a GROUP BY hospital_id_node`, [startDate, endDate])
  }

  getPUIday(db: Knex, startDate, endDate) {
    return db.raw(`SELECT
    r.hospital_id_node,
    COUNT( * ) AS qty 
  FROM
    p_covid_case_details p
    JOIN p_covid_cases pc ON pc.id = p.covid_case_id
    JOIN p_patients pp ON pp.id = pc.patient_id
    LEFT JOIN wm_requisitions r ON r.hospital_id_node = pp.hospital_id 
    AND r.covid_case_detail_id = p.id 
  WHERE
    p.entry_date BETWEEN ?
    AND ?
    AND p.gcs_id = 5 
    AND p.status = 'ADMIT' 
  GROUP BY
    r.hospital_id_node`, [startDate, endDate])
  }

  getConfirmPerson(db: Knex, startDate, endDate) {
    return db.raw(`SELECT
      r.hospital_id_node,
      COUNT( * ) AS qty
    FROM
      p_covid_case_details p
      JOIN p_covid_cases pc ON pc.id = p.covid_case_id
      JOIN p_patients pp ON pp.id = pc.patient_id
      LEFT JOIN wm_requisitions r ON r.hospital_id_node = pp.hospital_id 
      AND r.covid_case_detail_id = p.id 
    WHERE
      p.entry_date BETWEEN ?
      AND ?
      AND p.gcs_id IN (1,2,3,4)
      AND p.status = 'ADMIT' 
    GROUP BY
      r.hospital_id_node`, [startDate, endDate])
  }

  exportAll(db: Knex, startDate, endDate) {
    return db.raw(`SELECT
    wr.hospital_id_node,
    wr.hospital_id_client,
    h.hospcode,
    h.hospname,
    h.province_name,
    h.zone_code,
    puip.person_qty AS pui_person,
    puid.day_qty AS pui_day,
    s.sday AS confirm_qty,
    modd.modday AS mod_day,
    mildd.mildday AS mild_day,
    asymd.asymday AS asym_day,
    SUM( IF ( ( g.id = 9 ), rd.qty, 0 ) ) AS surgical_gown,
    SUM( IF ( ( g.id = 10 ), rd.qty, 0 ) ) AS cover_all1,
    SUM( IF ( ( g.id = 11 ), rd.qty, 0 ) ) AS cover_all2,
    SUM( IF ( ( g.id = 12 ), rd.qty, 0 ) ) AS n95,
    SUM( IF ( ( g.id = 13 ), rd.qty, 0 ) ) AS shoe_cover,
    SUM( IF ( ( g.id = 14 ), rd.qty, 0 ) ) AS surgical_hood 
  FROM
    wm_requisitions wr
    JOIN wm_requisition_details rd ON rd.requisition_id = wr.id
    JOIN p_covid_case_details pd on pd.id = wr.covid_case_detail_id
    JOIN p_covid_cases p on p.id = pd.covid_case_id
    JOIN b_hospitals h ON h.id = wr.hospital_id_client
    JOIN b_generics g ON g.id = rd.generic_id
    LEFT JOIN (
    SELECT
      a.hospital_id_client,
      COUNT( * ) AS person_qty 
    FROM
      (
      SELECT
        r.hospital_id_client,
        COUNT( * ) AS person_day 
      FROM
        p_covid_case_details p
        JOIN p_covid_cases pc ON pc.id = p.covid_case_id
        JOIN p_patients pp ON pp.id = pc.patient_id
        JOIN wm_requisitions r ON r.covid_case_detail_id = p.id 
      WHERE
        p.create_date BETWEEN ? 
        AND ? 
        AND p.gcs_id = 5 
        AND pc.is_deleted = 'N' 
        AND p.STATUS = 'ADMIT' 
      GROUP BY
        pp.id 
      ) AS a 
    GROUP BY
      hospital_id_client 
    ) AS puip ON puip.hospital_id_client = wr.hospital_id_client
    LEFT JOIN (
    SELECT
      r.hospital_id_client,
      COUNT( * ) AS day_qty 
    FROM
      p_covid_case_details p
      JOIN p_covid_cases pc ON pc.id = p.covid_case_id
      JOIN p_patients pp ON pp.id = pc.patient_id
      JOIN wm_requisitions r ON r.covid_case_detail_id = p.id 
    WHERE
      p.create_date BETWEEN ? 
      AND ? 
      AND p.gcs_id = 5 
      AND pc.is_deleted = 'N' 
      AND p.STATUS = 'ADMIT' 
    GROUP BY
      r.hospital_id_client 
    ) AS puid ON puid.hospital_id_client = wr.hospital_id_client
    LEFT JOIN (
    SELECT
      r.hospital_id_client,
      COUNT( * ) AS confirm_qty 
    FROM
      p_covid_case_details p
      JOIN p_covid_cases pc ON pc.id = p.covid_case_id
      JOIN p_patients pp ON pp.id = pc.patient_id
      JOIN wm_requisitions r ON r.covid_case_detail_id = p.id 
    WHERE
      p.create_date BETWEEN ? 
      AND ? 
      AND p.gcs_id IN ( 1, 2, 3, 4 ) 
      AND pc.is_deleted = 'N' 
      AND p.STATUS = 'ADMIT' 
    GROUP BY
      r.hospital_id_client 
    ) AS cf ON cf.hospital_id_client = wr.hospital_id_client
    LEFT JOIN (
    SELECT
      r.hospital_id_client,
      COUNT( * ) AS sday 
    FROM
      p_covid_case_details p
      JOIN p_covid_cases pc ON pc.id = p.covid_case_id
      JOIN p_patients pp ON pp.id = pc.patient_id
      JOIN wm_requisitions r ON r.covid_case_detail_id = p.id 
    WHERE
      p.create_date BETWEEN ? 
      AND ? 
      AND p.gcs_id = 1 
      AND pc.is_deleted = 'N' 
      AND p.STATUS = 'ADMIT' 
    GROUP BY
      r.hospital_id_client 
    ) AS s ON s.hospital_id_client = wr.hospital_id_client
    LEFT JOIN (
    SELECT
      r.hospital_id_client,
      COUNT( * ) AS modday 
    FROM
      p_covid_case_details p
      JOIN p_covid_cases pc ON pc.id = p.covid_case_id
      JOIN p_patients pp ON pp.id = pc.patient_id
      JOIN wm_requisitions r ON r.covid_case_detail_id = p.id 
    WHERE
      p.create_date BETWEEN ? 
      AND ? 
      AND p.gcs_id = 2 
      AND pc.is_deleted = 'N' 
      AND p.STATUS = 'ADMIT' 
    GROUP BY
      r.hospital_id_client 
    ) AS modd ON modd.hospital_id_client = wr.hospital_id_client
    LEFT JOIN (
    SELECT
      r.hospital_id_client,
      COUNT( * ) AS mildday 
    FROM
      p_covid_case_details p
      JOIN p_covid_cases pc ON pc.id = p.covid_case_id
      JOIN p_patients pp ON pp.id = pc.patient_id
      JOIN wm_requisitions r ON r.covid_case_detail_id = p.id 
    WHERE
      p.create_date BETWEEN ? 
      AND ? 
      AND p.gcs_id = 3 
      AND pc.is_deleted = 'N' 
      AND p.STATUS = 'ADMIT' 
    GROUP BY
      r.hospital_id_client 
    ) AS mildd ON mildd.hospital_id_client = wr.hospital_id_client
    LEFT JOIN (
    SELECT
      r.hospital_id_client,
      COUNT( * ) AS asymday 
    FROM
      p_covid_case_details p
      JOIN p_covid_cases pc ON pc.id = p.covid_case_id
      JOIN p_patients pp ON pp.id = pc.patient_id
      JOIN wm_requisitions r ON r.covid_case_detail_id = p.id 
    WHERE
      p.create_date BETWEEN ? 
      AND ? 
      AND p.gcs_id = 4 
      AND pc.is_deleted = 'N' 
      AND p.STATUS = 'ADMIT' 
    GROUP BY
      r.hospital_id_client 
    ) AS asymd ON asymd.hospital_id_client = wr.hospital_id_client 
  WHERE
    wr.create_date BETWEEN ? 
    AND ? 
    AND wr.type = 'SUPPLIES' 
    AND wr.is_deleted = 'N' 
    AND p.is_deleted = 'N'
  GROUP BY
    wr.hospital_id_client 
  ORDER BY
    h.zone_code`, [startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate])
  }
}