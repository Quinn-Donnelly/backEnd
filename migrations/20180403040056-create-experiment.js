'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('experiments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      aid: {
        type: Sequelize.INTEGER
      },
      acid: {
        type: Sequelize.INTEGER
      },
      aeid: {
        type: Sequelize.INTEGER
      },
      asid: {
        type: Sequelize.INTEGER
      },
      assay_source_name: {
        type: Sequelize.STRING
      },
      assay_source_long_name: {
        type: Sequelize.STRING
      },
      assay_source_desc: {
        type: Sequelize.TEXT
      },
      assay_name: {
        type: Sequelize.STRING
      },
      assay_desc: {
        type: Sequelize.TEXT
      },
      timepoint_hr: {
        type: Sequelize.INTEGER
      },
      organism_id: {
        type: Sequelize.INTEGER
      },
      organism: {
        type: Sequelize.STRING
      },
      tissue: {
        type: Sequelize.STRING
      },
      cell_format: {
        type: Sequelize.STRING
      },
      cell_free_component_source: {
        type: Sequelize.STRING
      },
      cell_short_name: {
        type: Sequelize.STRING
      },
      cell_growth_mode: {
        type: Sequelize.STRING
      },
      assay_footprint: {
        type: Sequelize.STRING
      },
      assay_format_type: {
        type: Sequelize.STRING
      },
      assay_format_type_sub: {
        type: Sequelize.STRING
      },
      content_readout_type: {
        type: Sequelize.STRING
      },
      dilution_solvent: {
        type: Sequelize.STRING
      },
      dilution_solvent_percent_max: {
        type: Sequelize.FLOAT
      },
      assay_component_name: {
        type: Sequelize.STRING
      },
      assay_component_desc: {
        type: Sequelize.TEXT
      },
      assay_component_target_desc: {
        type: Sequelize.TEXT
      },
      parameter_readout_type: {
        type: Sequelize.STRING
      },
      assay_design_type: {
        type: Sequelize.STRING
      },
      assay_design_type_sub: {
        type: Sequelize.STRING
      },
      biological_process_target: {
        type: Sequelize.STRING
      },
      detection_technology_type: {
        type: Sequelize.STRING
      },
      detection_technology_type_sub: {
        type: Sequelize.STRING
      },
      detection_technology: {
        type: Sequelize.STRING
      },
      signal_direction_type: {
        type: Sequelize.STRING
      },
      key_assay_reagent_type: {
        type: Sequelize.STRING
      },
      key_assay_reagent: {
        type: Sequelize.STRING
      },
      technological_target_type: {
        type: Sequelize.STRING
      },
      technological_target_type_sub: {
        type: Sequelize.STRING
      },
      assay_component_endpoint_name: {
        type: Sequelize.STRING
      },
      export_ready: {
        type: Sequelize.INTEGER
      },
      internal_ready: {
        type: Sequelize.INTEGER
      },
      assay_component_endpoint_desc: {
        type: Sequelize.TEXT
      },
      assay_function_type: {
        type: Sequelize.STRING
      },
      normalized_data_type: {
        type: Sequelize.STRING
      },
      analysis_direction: {
        type: Sequelize.STRING
      },
      burst_assay: {
        type: Sequelize.INTEGER
      },
      key_positive_control: {
        type: Sequelize.STRING
      },
      signal_direction: {
        type: Sequelize.STRING
      },
      intended_target_type: {
        type: Sequelize.STRING
      },
      intended_target_type_sub: {
        type: Sequelize.STRING
      },
      intended_target_family: {
        type: Sequelize.STRING
      },
      intended_target_family_sub: {
        type: Sequelize.STRING
      },
      fit_all: {
        type: Sequelize.INTEGER
      },
      reagent_arid: {
        type: Sequelize.STRING
      },
      reagent_reagent_name_value: {
        type: Sequelize.TEXT
      },
      reagent_reagent_name_value_type: {
        type: Sequelize.TEXT
      },
      reagent_culture_or_assay: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('experiments');
  }
};
