/**
 * Import AAdvantage Brand Error Codes & Parts
 * Data from Nick's Grok research for Ryan Smith pitch
 */

import { db } from "../db";
import { diagnosticCodes, parts } from "@shared/schema";
import { count } from "drizzle-orm";

// Complete brand data from research
const AADVANTAGE_BRAND_DATA = {
  brands: {
    "Dexter": {
      error_codes: [
        { code: "VFD Non Existent", description: "Communication fault between controller and drive", troubleshooting: "Check wiring; reset power; contact representative", common_parts: [
          { part_number: "9452-001-001", description: "Belt", link: "https://www.partsking.com/dexter-belt-9452-001-001", cost: "$50" },
          { part_number: "9539-461-001", description: "Door Sensor", link: "https://www.goldcoinlaundry.com/dexter-door-sensor-9539-461-001", cost: "$75" },
          { part_number: "F200131000P", description: "Control Board", link: "https://parts.alliancelaundry.com/dexter-control-board-f200131000p", cost: "$200" }
        ]},
        { code: "F21", description: "Data error on communications", troubleshooting: "Reset control; check connections", common_parts: [
          { part_number: "137108100", description: "Pump", link: "https://www.elsequip.com/dexter-pump-137108100", cost: "$150" }
        ]},
        { code: "E:10", description: "Door Lock Error", troubleshooting: "Check sensor; align door", common_parts: [
          { part_number: "9539-461-001", description: "Sensor", link: "https://www.partsking.com/dexter-sensor-9539-461-001", cost: "$75" }
        ]},
        { code: "E:01", description: "Fill Timeout - Water not reaching level", troubleshooting: "Check water supply valves, inlet hoses, water pressure", common_parts: [
          { part_number: "9379-250-001", description: "Water Inlet Valve", link: "https://www.partsking.com/dexter", cost: "$85" }
        ]},
        { code: "E:02", description: "Drain Timeout - Water not draining", troubleshooting: "Check drain hose, pump, lint trap", common_parts: [
          { part_number: "9244-160-003", description: "Drain Pump", link: "https://www.goldcoinlaundry.com/dexter-parts", cost: "$165" }
        ]},
        { code: "E:03", description: "Door Lock Failure", troubleshooting: "Check door latch mechanism and wiring", common_parts: [
          { part_number: "9536-032-002", description: "Door Lock Assembly", link: "https://www.partsking.com/dexter", cost: "$95" }
        ]},
        { code: "E:04", description: "Door Unlock Failure", troubleshooting: "Check door lock solenoid and connections", common_parts: [
          { part_number: "9536-032-002", description: "Door Lock Assembly", link: "https://www.partsking.com/dexter", cost: "$95" }
        ]},
        { code: "E:05", description: "Unbalance Error - Load imbalance detected", troubleshooting: "Redistribute load, check suspension springs", common_parts: [
          { part_number: "9908-082-001", description: "Shock Absorber", link: "https://www.goldcoinlaundry.com/dexter-parts", cost: "$45" }
        ]},
        { code: "E:06", description: "Motor Overload", troubleshooting: "Check motor connections, bearings, belt tension", common_parts: [
          { part_number: "9376-268-003", description: "Drive Motor", link: "https://www.partsking.com/dexter", cost: "$385" }
        ]},
        { code: "E:07", description: "Motor Stall", troubleshooting: "Check for jammed drum, motor brushes", common_parts: [
          { part_number: "9376-268-003", description: "Drive Motor", link: "https://www.partsking.com/dexter", cost: "$385" }
        ]},
        { code: "E:08", description: "High Water Level", troubleshooting: "Check pressure switch, water inlet valve", common_parts: [
          { part_number: "9539-456-001", description: "Pressure Switch", link: "https://www.goldcoinlaundry.com/dexter-parts", cost: "$65" }
        ]},
        { code: "E:09", description: "Low Water Level", troubleshooting: "Check water supply, inlet valve, pressure switch", common_parts: [
          { part_number: "9379-250-001", description: "Water Inlet Valve", link: "https://www.partsking.com/dexter", cost: "$85" }
        ]},
        { code: "E:11", description: "Thermistor Open", troubleshooting: "Check temperature sensor wiring and connections", common_parts: [
          { part_number: "9545-105-001", description: "Thermistor", link: "https://www.partsking.com/dexter", cost: "$35" }
        ]},
        { code: "E:12", description: "Thermistor Short", troubleshooting: "Replace temperature sensor", common_parts: [
          { part_number: "9545-105-001", description: "Thermistor", link: "https://www.partsking.com/dexter", cost: "$35" }
        ]},
        { code: "E:13", description: "High Temperature Error", troubleshooting: "Check heating element, thermostat", common_parts: [
          { part_number: "9857-116-002", description: "Heating Element", link: "https://www.goldcoinlaundry.com/dexter-parts", cost: "$125" }
        ]},
        { code: "E:14", description: "VFD Fault - Inverter error", troubleshooting: "Check VFD connections, reset power", common_parts: [
          { part_number: "9732-237-001", description: "VFD Controller", link: "https://www.partsking.com/dexter", cost: "$450" }
        ]},
        { code: "E:15", description: "VFD Communication Error", troubleshooting: "Check communication cables between boards", common_parts: [
          { part_number: "9857-147-001", description: "Control Board", link: "https://www.partsking.com/dexter", cost: "$285" }
        ]},
        { code: "E:20", description: "EEPROM Error", troubleshooting: "Replace control board", common_parts: [
          { part_number: "9857-147-001", description: "Control Board", link: "https://www.partsking.com/dexter", cost: "$285" }
        ]},
        { code: "E:21", description: "Control Board Communication Error", troubleshooting: "Check ribbon cables, reset power", common_parts: [
          { part_number: "9857-147-001", description: "Control Board", link: "https://www.partsking.com/dexter", cost: "$285" }
        ]},
        { code: "E:30", description: "Coin Counter Error", troubleshooting: "Check coin mechanism, wiring", common_parts: [
          { part_number: "9857-183-001", description: "Coin Acceptor", link: "https://www.goldcoinlaundry.com/dexter-parts", cost: "$175" }
        ]}
      ],
      manuals: [
        { name: "T-600 Troubleshooting Fault Codes", link: "https://dexter.com/upl/downloads/coin-products/documents/t-600-troubleshooting-fault-codes-and-schematics.pdf" },
        { name: "Common Washer Troubleshooting", link: "https://dexter.com/upl/downloads/library/common-washer-troubleshooting-and-fault-codes.pdf" },
        { name: "Common Dryer Troubleshooting", link: "https://dexter.com/upl/downloads/library/common-dryer-troubleshooting-and-fault-codes.pdf" }
      ],
      parts_catalog: "https://dexter.com/support/parts-lookup/"
    },
    "Continental Girbau": {
      error_codes: [
        { code: "A (Alm - A)", description: "Machine not level or unbalance sensor failure", troubleshooting: "Verify panels/fasteners; check balance switch/wiring/inverter", common_parts: [
          { part_number: "CG-137", description: "Pressure Switch", link: "https://www.partstown.com/continental-girbau/cg-137", cost: "$80" }
        ]},
        { code: "H2", description: "High temperature", troubleshooting: "Check thermostat; replace protection", common_parts: [
          { part_number: "137240800", description: "Thermostat", link: "https://www.continental-laundry.com/parts", cost: "$50" }
        ]},
        { code: "E13", description: "Leak detected", troubleshooting: "Inspect hoses; replace valve", common_parts: [
          { part_number: "137240800", description: "Water Valve", link: "https://www.continental-laundry.com/parts", cost: "$50" }
        ]},
        { code: "E01", description: "Water fill timeout", troubleshooting: "Check inlet valves, water pressure, drain pump", common_parts: [
          { part_number: "GH-2891", description: "Inlet Valve", link: "https://www.partstown.com/continental-girbau", cost: "$95" }
        ]},
        { code: "E02", description: "Drain timeout", troubleshooting: "Check drain pump, drain hose obstruction", common_parts: [
          { part_number: "GH-3445", description: "Drain Pump", link: "https://www.partstown.com/continental-girbau", cost: "$175" }
        ]},
        { code: "E03", description: "Door lock failure", troubleshooting: "Check door lock mechanism and micro switches", common_parts: [
          { part_number: "GH-4521", description: "Door Lock Assembly", link: "https://www.continental-laundry.com/parts", cost: "$110" }
        ]},
        { code: "E04", description: "Door unlock failure", troubleshooting: "Check door lock solenoid, wiring harness", common_parts: [
          { part_number: "GH-4521", description: "Door Lock Assembly", link: "https://www.continental-laundry.com/parts", cost: "$110" }
        ]},
        { code: "E05", description: "Motor overtemperature", troubleshooting: "Check motor cooling, belt tension, bearings", common_parts: [
          { part_number: "GH-5672", description: "Motor Thermal Protector", link: "https://www.partstown.com/continental-girbau", cost: "$45" }
        ]},
        { code: "E06", description: "Inverter fault", troubleshooting: "Check inverter connections, power supply", common_parts: [
          { part_number: "GH-7823", description: "Inverter Board", link: "https://www.continental-laundry.com/parts", cost: "$485" }
        ]},
        { code: "E07", description: "Unbalance detected", troubleshooting: "Redistribute load, check suspension", common_parts: [
          { part_number: "GH-3345", description: "Shock Absorber", link: "https://www.partstown.com/continental-girbau", cost: "$55" }
        ]},
        { code: "E08", description: "High water level", troubleshooting: "Check pressure switch, inlet valve sticking", common_parts: [
          { part_number: "CG-137", description: "Pressure Switch", link: "https://www.partstown.com/continental-girbau", cost: "$80" }
        ]},
        { code: "E09", description: "Low water level", troubleshooting: "Check water supply, inlet valve", common_parts: [
          { part_number: "GH-2891", description: "Inlet Valve", link: "https://www.partstown.com/continental-girbau", cost: "$95" }
        ]},
        { code: "E10", description: "Temperature sensor open", troubleshooting: "Check sensor wiring, replace sensor", common_parts: [
          { part_number: "GH-1123", description: "Temperature Sensor", link: "https://www.continental-laundry.com/parts", cost: "$40" }
        ]},
        { code: "E11", description: "Temperature sensor short", troubleshooting: "Replace temperature sensor", common_parts: [
          { part_number: "GH-1123", description: "Temperature Sensor", link: "https://www.continental-laundry.com/parts", cost: "$40" }
        ]},
        { code: "E12", description: "Heat timeout", troubleshooting: "Check heating element, relay, thermostat", common_parts: [
          { part_number: "GH-6734", description: "Heating Element", link: "https://www.partstown.com/continental-girbau", cost: "$145" }
        ]},
        { code: "E14", description: "Memory error", troubleshooting: "Replace control board", common_parts: [
          { part_number: "GH-9012", description: "Main Control Board", link: "https://www.continental-laundry.com/parts", cost: "$345" }
        ]},
        { code: "E15", description: "Communication error", troubleshooting: "Check cable connections between boards", common_parts: [
          { part_number: "GH-9012", description: "Main Control Board", link: "https://www.continental-laundry.com/parts", cost: "$345" }
        ]}
      ],
      manuals: [
        { name: "E-Series Error Codes", link: "https://continental-laundry.com/wp-content/uploads/2024/07/ST-101.R4-E-Series-Error-Codes.pdf" },
        { name: "Inteli Control Error Codes", link: "https://continental-laundry.com/wp-content/uploads/2024/07/ST-102.R2-Inteli-Control-Error-Codes.pdf" }
      ],
      parts_catalog: "https://continental-laundry.com/wp-content/uploads/2024/04/BrochureCatalog.pdf"
    },
    "Maytag": {
      error_codes: [
        { code: "0F", description: "Oversuds detected", troubleshooting: "Check detergent; run rinse cycle", common_parts: [
          { part_number: "W11307244", description: "Lid Lock Assembly", link: "https://www.maytag.com/accessories/laundry-accessories/washer.html", cost: "$100" }
        ]},
        { code: "F# E#", description: "System error code", troubleshooting: "Press Start/Pause to clear; contact service", common_parts: [
          { part_number: "W10183157", description: "Wire Harness", link: "https://www.appliancefactoryparts.com", cost: "$80" }
        ]},
        { code: "L2", description: "Low voltage detected", troubleshooting: "Check power supply and outlet", common_parts: [
          { part_number: "W10280489", description: "Control Board", link: "https://parts.alliancelaundry.com", cost: "$200" }
        ]},
        { code: "dLO", description: "Door lock error", troubleshooting: "Check door latch, lock assembly", common_parts: [
          { part_number: "W11307244", description: "Door Lock", link: "https://www.maytag.com/accessories", cost: "$150" }
        ]},
        { code: "drn", description: "Drain error", troubleshooting: "Check pump; replace if needed", common_parts: [
          { part_number: "W10183157", description: "Drain Pump", link: "https://www.partstown.com/maytag-parts", cost: "$120" }
        ]},
        { code: "F5E2", description: "Lid lock malfunction", troubleshooting: "Check wiring; replace switch", common_parts: [
          { part_number: "W10238287", description: "Lid Switch", link: "https://www.maytag.com/accessories", cost: "$100" }
        ]},
        { code: "F0E1", description: "Load detected at start", troubleshooting: "Remove items; restart cycle", common_parts: [] },
        { code: "F0E2", description: "Detergent dispenser issue", troubleshooting: "Clean dispenser; check for clogs", common_parts: [
          { part_number: "W10861225", description: "Dispenser Assembly", link: "https://www.partstown.com/maytag-parts", cost: "$85" }
        ]},
        { code: "F0E3", description: "Load detected - door open", troubleshooting: "Close door; check door switch", common_parts: [
          { part_number: "W10238287", description: "Door Switch", link: "https://www.maytag.com/accessories", cost: "$55" }
        ]},
        { code: "F1E1", description: "Main control board fault", troubleshooting: "Replace control board", common_parts: [
          { part_number: "W10280489", description: "Main Control Board", link: "https://www.partstown.com/maytag-parts", cost: "$245" }
        ]},
        { code: "F2E1", description: "Stuck key on user interface", troubleshooting: "Check user interface; replace if stuck", common_parts: [
          { part_number: "W10480274", description: "User Interface", link: "https://www.maytag.com/accessories", cost: "$135" }
        ]},
        { code: "F3E1", description: "Pressure switch/sensor fault", troubleshooting: "Check pressure switch and hose", common_parts: [
          { part_number: "W10448876", description: "Pressure Switch", link: "https://www.partstown.com/maytag-parts", cost: "$45" }
        ]},
        { code: "F3E2", description: "Temperature sensor fault", troubleshooting: "Check sensor wiring and connections", common_parts: [
          { part_number: "W10467289", description: "Thermistor", link: "https://www.maytag.com/accessories", cost: "$35" }
        ]},
        { code: "F5E1", description: "Door switch fault", troubleshooting: "Check door switch circuit", common_parts: [
          { part_number: "W10238287", description: "Door Switch", link: "https://www.partstown.com/maytag-parts", cost: "$55" }
        ]},
        { code: "F7E1", description: "Motor speed sensor fault", troubleshooting: "Check motor connections; replace sensor", common_parts: [
          { part_number: "W10178988", description: "Motor Sensor", link: "https://www.maytag.com/accessories", cost: "$65" }
        ]},
        { code: "F8E1", description: "Water fill issue", troubleshooting: "Check inlet valves and supply", common_parts: [
          { part_number: "W10219643", description: "Inlet Valve", link: "https://www.partstown.com/maytag-parts", cost: "$75" }
        ]},
        { code: "F8E3", description: "Overflow condition", troubleshooting: "Check pressure switch and drain", common_parts: [
          { part_number: "W10448876", description: "Pressure Switch", link: "https://www.maytag.com/accessories", cost: "$45" }
        ]},
        { code: "F9E1", description: "Long drain time", troubleshooting: "Check drain pump and hose", common_parts: [
          { part_number: "W10276397", description: "Drain Pump", link: "https://www.partstown.com/maytag-parts", cost: "$125" }
        ]}
      ],
      manuals: [
        { name: "MXR Series Manual", link: "https://www.groupdynamics-laundry.com/mans_files/6/W10602871.pdf" },
        { name: "Diagnostic Codes", link: "https://tlinx.cscsw.com/prod/CSCPOTR/Support/MaytagFaultCodes.pdf" }
      ],
      parts_catalog: "https://www.maytag.com/services/manuals.html"
    },
    "Whirlpool": {
      error_codes: [
        { code: "F0E1", description: "Load detected at start", troubleshooting: "Redistribute load; restart", common_parts: [
          { part_number: "W11306770", description: "Control Board", link: "https://www.whirlpool.com/content/dam/global/documents/201908/repair-parts-list-w11306770-reva.pdf", cost: "$200" }
        ]},
        { code: "F5E2", description: "Lid lock error", troubleshooting: "Check wiring and lid lock", common_parts: [
          { part_number: "W11316893", description: "Lid Lock Sensor", link: "https://www.whirlpool.com", cost: "$120" }
        ]},
        { code: "LdL", description: "Lid lock failure", troubleshooting: "Test lid lock switch", common_parts: [
          { part_number: "W11320651", description: "Lid Lock Switch", link: "https://www.whirlpool.com", cost: "$60" }
        ]},
        { code: "F0E2", description: "Detergent tray closed", troubleshooting: "Open/close dispenser; restart", common_parts: [
          { part_number: "W10861225", description: "Dispenser", link: "https://www.whirlpoolparts.com", cost: "$85" }
        ]},
        { code: "F0E3", description: "Drain pump blocked", troubleshooting: "Check pump for obstruction", common_parts: [
          { part_number: "W10276397", description: "Drain Pump", link: "https://www.whirlpoolparts.com", cost: "$115" }
        ]},
        { code: "F1E1", description: "Control board fault", troubleshooting: "Replace main control", common_parts: [
          { part_number: "W11306770", description: "Main Control", link: "https://www.whirlpoolparts.com", cost: "$235" }
        ]},
        { code: "F2E1", description: "Interface board fault", troubleshooting: "Check interface connections", common_parts: [
          { part_number: "W11162436", description: "Interface Board", link: "https://www.whirlpool.com", cost: "$145" }
        ]},
        { code: "F3E1", description: "Pressure switch fault", troubleshooting: "Check switch and air hose", common_parts: [
          { part_number: "W10448876", description: "Pressure Switch", link: "https://www.whirlpoolparts.com", cost: "$45" }
        ]},
        { code: "F3E2", description: "Temperature sensor open", troubleshooting: "Replace thermistor", common_parts: [
          { part_number: "W10467289", description: "Thermistor", link: "https://www.whirlpool.com", cost: "$35" }
        ]},
        { code: "F5E1", description: "Door switch open", troubleshooting: "Check door switch", common_parts: [
          { part_number: "W10238287", description: "Door Switch", link: "https://www.whirlpoolparts.com", cost: "$55" }
        ]},
        { code: "F5E3", description: "Door unlock failure", troubleshooting: "Check door lock assembly", common_parts: [
          { part_number: "W11316893", description: "Door Lock", link: "https://www.whirlpool.com", cost: "$95" }
        ]},
        { code: "F7E1", description: "Motor speed fault", troubleshooting: "Check motor and sensor", common_parts: [
          { part_number: "W10178988", description: "Motor Sensor", link: "https://www.whirlpoolparts.com", cost: "$65" }
        ]},
        { code: "F8E1", description: "Low water flow", troubleshooting: "Check inlet valves", common_parts: [
          { part_number: "W10219643", description: "Inlet Valve", link: "https://www.whirlpool.com", cost: "$75" }
        ]},
        { code: "F8E3", description: "Overflow detected", troubleshooting: "Check pressure switch", common_parts: [
          { part_number: "W10448876", description: "Pressure Switch", link: "https://www.whirlpoolparts.com", cost: "$45" }
        ]},
        { code: "F9E1", description: "Drain timeout", troubleshooting: "Check drain pump", common_parts: [
          { part_number: "W10276397", description: "Drain Pump", link: "https://www.whirlpool.com", cost: "$115" }
        ]}
      ],
      manuals: [
        { name: "Commercial Tech Sheet", link: "https://www.whirlpool.com/content/dam/global/documents/201905/tech-sheet-w11316893-rev-a.pdf" },
        { name: "Technical Manual", link: "https://www.whirlpool.com/content/dam/global/documents/202306/technical-manual-w11663204-revb.pdf" }
      ],
      parts_catalog: "https://www.whirlpoolparts.com/Shop-For-Parts/a11/Washing-Machine-Parts"
    },
    "LG": {
      error_codes: [
        { code: "OE", description: "Drain error - water not draining", troubleshooting: "Check hose; replace pump", common_parts: [
          { part_number: "WH23X10028", description: "Drain Pump", link: "https://lgparts.com/collections/washer", cost: "$150" }
        ]},
        { code: "IE", description: "Water inlet error", troubleshooting: "Check valves and supply", common_parts: [
          { part_number: "5220FR2008L", description: "Inlet Valve", link: "https://lgparts.com/collections/washer", cost: "$85" }
        ]},
        { code: "UE", description: "Unbalanced load", troubleshooting: "Redistribute items; level machine", common_parts: [
          { part_number: "4901ER2003A", description: "Shock Absorber", link: "https://lgparts.com/collections/washer", cost: "$55" }
        ]},
        { code: "dE", description: "Door open error", troubleshooting: "Close and latch door properly", common_parts: [
          { part_number: "6601ER1004C", description: "Door Switch", link: "https://lgparts.com/collections/washer", cost: "$45" }
        ]},
        { code: "dE1", description: "Door lock error", troubleshooting: "Check door lock mechanism", common_parts: [
          { part_number: "6931EL3003D", description: "Door Lock", link: "https://lgparts.com/collections/washer", cost: "$95" }
        ]},
        { code: "dE2", description: "Door switch malfunction", troubleshooting: "Replace door switch", common_parts: [
          { part_number: "6601ER1004C", description: "Door Switch", link: "https://lgparts.com/collections/washer", cost: "$45" }
        ]},
        { code: "LE", description: "Motor lock error", troubleshooting: "Check motor and rotor", common_parts: [
          { part_number: "4417EA1002Y", description: "Stator Assembly", link: "https://lgparts.com/collections/washer", cost: "$185" }
        ]},
        { code: "SE", description: "Motor sensor error", troubleshooting: "Check sensor connection", common_parts: [
          { part_number: "6501KW2002A", description: "Hall Sensor", link: "https://lgparts.com/collections/washer", cost: "$35" }
        ]},
        { code: "FE", description: "Overflow error", troubleshooting: "Check inlet valve and switch", common_parts: [
          { part_number: "6501KW2001A", description: "Pressure Switch", link: "https://lgparts.com/collections/washer", cost: "$55" }
        ]},
        { code: "PE", description: "Pressure sensor error", troubleshooting: "Check pressure switch", common_parts: [
          { part_number: "6501KW2001A", description: "Pressure Switch", link: "https://lgparts.com/collections/washer", cost: "$55" }
        ]},
        { code: "tE", description: "Heating error", troubleshooting: "Check heater and sensor", common_parts: [
          { part_number: "6930EL3001A", description: "Heater Assembly", link: "https://lgparts.com/collections/washer", cost: "$125" }
        ]},
        { code: "E6", description: "Clutch motor error", troubleshooting: "Check clutch assembly", common_parts: [
          { part_number: "AHQ73310301", description: "Clutch Motor", link: "https://lgparts.com/collections/washer", cost: "$165" }
        ]},
        { code: "AE", description: "Communication error", troubleshooting: "Check board connections", common_parts: [
          { part_number: "EBR38144404", description: "Main Board", link: "https://lgparts.com/collections/washer", cost: "$245" }
        ]},
        { code: "CE", description: "Current sensor error", troubleshooting: "Check motor connections", common_parts: [
          { part_number: "EBR38144404", description: "Main Board", link: "https://lgparts.com/collections/washer", cost: "$245" }
        ]},
        { code: "PF", description: "Power failure", troubleshooting: "Check power supply; restart", common_parts: [] }
      ],
      manuals: [
        { name: "Commercial Parts Master Book", link: "https://www.fowlercompanies.com/wp-content/uploads/2019/11/LG-GCW-F_P-1069-parts-manual-1.pdf" },
        { name: "Commercial Laundry Catalog", link: "https://www.lg.com/content/dam/channel/wcms/id/images/business/tools-and-resources/pdf/01_LG_Commercial_Laundry_Catalog.pdf" }
      ],
      parts_catalog: "https://lgparts.com/collections/washer"
    },
    "B&C Technologies": {
      error_codes: [
        { code: "Temperature sensor failure", description: "Sensor reading out of range", troubleshooting: "Replace temperature sensor", common_parts: [
          { part_number: "EL-6", description: "Control Board", link: "https://bandctech.com/Manuals/040%20-%20EL-6%20Programing%20manual.pdf", cost: "$200" }
        ]},
        { code: "full", description: "Water level detected when none present", troubleshooting: "Check drain; verify pressure switch", common_parts: [
          { part_number: "BC-PS-100", description: "Pressure Switch", link: "https://bandctech.com/commercial-washer-dryer-parts-search.php", cost: "$150" }
        ]},
        { code: "E (Alm - E)", description: "Unbalance sensor error", troubleshooting: "Check switch and circuit", common_parts: [
          { part_number: "BC-UB-200", description: "Unbalance Switch", link: "https://bandctech.com/commercial-washer-dryer-parts-search.php", cost: "$80" }
        ]},
        { code: "E01", description: "Fill timeout", troubleshooting: "Check water supply and inlet valves", common_parts: [
          { part_number: "BC-IV-300", description: "Inlet Valve", link: "https://bandctech.com/commercial-washer-dryer-parts-search.php", cost: "$95" }
        ]},
        { code: "E02", description: "Drain timeout", troubleshooting: "Check drain pump and hose", common_parts: [
          { part_number: "BC-DP-400", description: "Drain Pump", link: "https://bandctech.com/commercial-washer-dryer-parts-search.php", cost: "$175" }
        ]},
        { code: "E03", description: "Door lock failure", troubleshooting: "Check door lock mechanism", common_parts: [
          { part_number: "BC-DL-500", description: "Door Lock", link: "https://bandctech.com/commercial-washer-dryer-parts-search.php", cost: "$125" }
        ]},
        { code: "E04", description: "Door unlock failure", troubleshooting: "Check door lock solenoid", common_parts: [
          { part_number: "BC-DL-500", description: "Door Lock", link: "https://bandctech.com/commercial-washer-dryer-parts-search.php", cost: "$125" }
        ]},
        { code: "E05", description: "Motor overload", troubleshooting: "Check motor and belt tension", common_parts: [
          { part_number: "BC-MT-600", description: "Drive Motor", link: "https://bandctech.com/commercial-washer-dryer-parts-search.php", cost: "$385" }
        ]},
        { code: "E06", description: "Inverter fault", troubleshooting: "Check inverter board", common_parts: [
          { part_number: "BC-INV-700", description: "Inverter", link: "https://bandctech.com/commercial-washer-dryer-parts-search.php", cost: "$475" }
        ]},
        { code: "E07", description: "High vibration", troubleshooting: "Level machine; check suspension", common_parts: [
          { part_number: "BC-SH-800", description: "Shock Absorber", link: "https://bandctech.com/commercial-washer-dryer-parts-search.php", cost: "$55" }
        ]},
        { code: "E08", description: "High water level", troubleshooting: "Check pressure switch", common_parts: [
          { part_number: "BC-PS-100", description: "Pressure Switch", link: "https://bandctech.com/commercial-washer-dryer-parts-search.php", cost: "$150" }
        ]},
        { code: "E09", description: "Low water level", troubleshooting: "Check water supply", common_parts: [
          { part_number: "BC-IV-300", description: "Inlet Valve", link: "https://bandctech.com/commercial-washer-dryer-parts-search.php", cost: "$95" }
        ]},
        { code: "E10", description: "Temperature sensor open", troubleshooting: "Replace sensor", common_parts: [
          { part_number: "BC-TS-900", description: "Thermistor", link: "https://bandctech.com/commercial-washer-dryer-parts-search.php", cost: "$40" }
        ]},
        { code: "E11", description: "Temperature sensor short", troubleshooting: "Replace sensor", common_parts: [
          { part_number: "BC-TS-900", description: "Thermistor", link: "https://bandctech.com/commercial-washer-dryer-parts-search.php", cost: "$40" }
        ]},
        { code: "E12", description: "Heating timeout", troubleshooting: "Check heating element", common_parts: [
          { part_number: "BC-HE-1000", description: "Heating Element", link: "https://bandctech.com/commercial-washer-dryer-parts-search.php", cost: "$135" }
        ]}
      ],
      manuals: [
        { name: "EL-6 Programming Manual", link: "https://bandctech.com/Manuals/040%20-%20EL-6%20Programing%20manual.pdf" },
        { name: "B-Computer Manual", link: "https://bandctech.com/Manuals/045%20-%20B-Computer%20Manual.pdf" },
        { name: "HE Series Manual", link: "https://bandctech.com/Manuals/080%20-%20HE%20Manual.pdf" },
        { name: "HE Parts Manual", link: "https://bandctech.com/Manuals/HE-Parts-manual.pdf" }
      ],
      parts_catalog: "https://bandctech.com/commercial-washer-dryer-parts-search.php"
    },
    "Econ-O": {
      error_codes: [
        { code: "HOUr", description: "Hours running display", troubleshooting: "Check usage log for maintenance", common_parts: [
          { part_number: "D512973", description: "Timer Switch", link: "https://www.partsking.com/pdf/Alliance/202731.pdf", cost: "$40" }
        ]},
        { code: "Err", description: "Error count display", troubleshooting: "Review specific error logs", common_parts: [
          { part_number: "D503688", description: "Display Board", link: "https://parts.alliancelaundry.com/c-268848", cost: "$185" }
        ]},
        { code: "F1", description: "Temperature sensor failure - high", troubleshooting: "Replace sensor", common_parts: [
          { part_number: "210018P", description: "Thermistor", link: "https://parts.alliancelaundry.com/c-268848", cost: "$35" }
        ]},
        { code: "F2", description: "Temperature sensor failure - low", troubleshooting: "Replace sensor", common_parts: [
          { part_number: "210018P", description: "Thermistor", link: "https://parts.alliancelaundry.com/c-268848", cost: "$35" }
        ]},
        { code: "E1", description: "Fill timeout", troubleshooting: "Check water supply and valves", common_parts: [
          { part_number: "209/00276/00", description: "Inlet Valve", link: "https://parts.alliancelaundry.com/c-268848", cost: "$85" }
        ]},
        { code: "E2", description: "Drain timeout", troubleshooting: "Check drain pump", common_parts: [
          { part_number: "510066P", description: "Drain Pump", link: "https://parts.alliancelaundry.com/c-268848", cost: "$155" }
        ]},
        { code: "E3", description: "Door lock error", troubleshooting: "Check door lock assembly", common_parts: [
          { part_number: "9450-041-001", description: "Door Lock", link: "https://parts.alliancelaundry.com/c-268848", cost: "$105" }
        ]},
        { code: "E4", description: "Door unlock error", troubleshooting: "Check door lock solenoid", common_parts: [
          { part_number: "9450-041-001", description: "Door Lock", link: "https://parts.alliancelaundry.com/c-268848", cost: "$105" }
        ]},
        { code: "E5", description: "Motor overload", troubleshooting: "Check motor and connections", common_parts: [
          { part_number: "510399P", description: "Motor", link: "https://parts.alliancelaundry.com/c-268848", cost: "$345" }
        ]},
        { code: "E6", description: "Unbalance error", troubleshooting: "Redistribute load", common_parts: [
          { part_number: "510181P", description: "Shock Absorber", link: "https://parts.alliancelaundry.com/c-268848", cost: "$45" }
        ]},
        { code: "E7", description: "High water level", troubleshooting: "Check pressure switch", common_parts: [
          { part_number: "510015P", description: "Pressure Switch", link: "https://parts.alliancelaundry.com/c-268848", cost: "$65" }
        ]},
        { code: "E8", description: "Low water level", troubleshooting: "Check water supply", common_parts: [
          { part_number: "209/00276/00", description: "Inlet Valve", link: "https://parts.alliancelaundry.com/c-268848", cost: "$85" }
        ]},
        { code: "E9", description: "Over temperature", troubleshooting: "Check thermostat", common_parts: [
          { part_number: "D504073", description: "Thermostat", link: "https://parts.alliancelaundry.com/c-268848", cost: "$55" }
        ]},
        { code: "E10", description: "Communication error", troubleshooting: "Check control board connections", common_parts: [
          { part_number: "D512842P", description: "Control Board", link: "https://parts.alliancelaundry.com/c-268848", cost: "$275" }
        ]}
      ],
      manuals: [
        { name: "EcoWash M2 Manual", link: "https://adclaundry.com/manuals/product.cfm?productAssetID=1895" },
        { name: "Parts Manual", link: "https://www.partsking.com/pdf/Alliance/202731.pdf" },
        { name: "OPL Manual", link: "https://www.fowlercompanies.com/wp-content/uploads/2019/09/8-1-Product-Manual.pdf" }
      ],
      parts_catalog: "https://parts.alliancelaundry.com/c-268848-commercial-econo-wash-laundry-replacement-parts-for-repair-service.html"
    }
  }
};

export async function importAAdvantageData() {
  console.log("🚀 Starting AAdvantage brand data import...");
  
  // Get initial counts for comparison
  const [initialCodes] = await db.select({ count: count() }).from(diagnosticCodes);
  const [initialParts] = await db.select({ count: count() }).from(parts);
  
  let totalCodesProcessed = 0;
  const errors: string[] = [];

  for (const [brandName, brand] of Object.entries(AADVANTAGE_BRAND_DATA.brands)) {
    console.log(`📦 Processing ${brandName}...`);
    
    for (const code of brand.error_codes) {
      try {
        const slug = `${brandName.toLowerCase().replace(/\s+/g, "-")}-${code.code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        
        await db.insert(diagnosticCodes).values({
          code: code.code,
          manufacturer: brandName,
          machineType: "washer",
          description: code.description,
          possibleCauses: [code.troubleshooting],
          troubleshootingSteps: [code.troubleshooting],
          requiredParts: code.common_parts.map(p => p.part_number),
          partsWithPricing: code.common_parts.map(p => ({
            partNumber: p.part_number,
            name: p.description,
            price: p.cost,
            link: p.link,
          })),
          severity: "medium",
          skillLevel: "intermediate",
          estimatedRepairTime: "30-60 minutes",
          slug,
        }).onConflictDoNothing();
        
        totalCodesProcessed++;
      } catch (e) {
        errors.push(`${brandName} ${code.code}: ${e}`);
      }
    }
    
    // Add unique parts
    const addedParts = new Set<string>();
    for (const code of brand.error_codes) {
      for (const part of code.common_parts) {
        if (addedParts.has(part.part_number)) continue;
        
        try {
          await db.insert(parts).values({
            name: part.description,
            partNumber: part.part_number,
            description: `${brandName} - ${part.description}`,
            price: part.cost.replace("$", ""),
            category: brandName,
            inStock: true,
          }).onConflictDoNothing();
          
          addedParts.add(part.part_number);
        } catch (e) {
        }
      }
    }
    
    console.log(`✅ ${brandName}: ${brand.error_codes.length} codes processed`);
  }
  
  // Get final counts and calculate actual inserts
  const [finalCodes] = await db.select({ count: count() }).from(diagnosticCodes);
  const [finalParts] = await db.select({ count: count() }).from(parts);
  
  const codesInserted = finalCodes.count - initialCodes.count;
  const partsInserted = finalParts.count - initialParts.count;
  const skipped = totalCodesProcessed - codesInserted;
  
  console.log(`\n🎉 Import complete!`);
  console.log(`   Codes processed: ${totalCodesProcessed}`);
  console.log(`   New codes inserted: ${codesInserted}`);
  console.log(`   Skipped (already exist): ${skipped}`);
  console.log(`   New parts inserted: ${partsInserted}`);
  console.log(`   Total codes in DB: ${finalCodes.count}`);
  console.log(`   Total parts in DB: ${finalParts.count}`);
  console.log(`   Errors: ${errors.length}`);
  
  return { 
    totalCodesProcessed, 
    codesInserted,
    partsInserted,
    skipped,
    totalCodes: finalCodes.count,
    totalParts: finalParts.count,
    errors 
  };
}

// Export only - run via API endpoint
