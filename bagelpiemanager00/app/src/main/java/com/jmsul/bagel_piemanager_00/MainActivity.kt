package com.jmsul.bagel_piemanager_00

import android.bluetooth.*
import android.bluetooth.BluetoothAdapter.STATE_CONNECTED
import android.content.Context
import android.content.Intent
import android.os.Build.VERSION
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.google.android.material.snackbar.Snackbar
import kotlinx.android.synthetic.main.activity_main.*
import java.nio.charset.StandardCharsets.UTF_8
import java.security.Key
import java.util.*
import java.util.jar.Manifest
import javax.crypto.Cipher
import javax.crypto.spec.SecretKeySpec
import kotlin.collections.ArrayList
import kotlin.experimental.xor


class MainActivity : AppCompatActivity() {
    companion object {
        val SERVICE_MEASUREMENT_UUID: UUID =
            UUID.fromString("6e400001-b5a3-f393-e0a9-e50e24dcca9e")
        val CHARACTERISTIC_MEASUREMENT_UUID: UUID =
            UUID.fromString("6e400003-b5a3-f393-e0a9-e50e24dcca9e")
        val CHARACTERISTIC_WRITE_UUID: UUID =
            UUID.fromString("6e400002-b5a3-f393-e0a9-e50e24dcca9e")
        val CLIENT_CHARACTERISTIC_CONFIG_UUID: UUID =
            UUID.fromString("00002902-0000-1000-8000-00805f9b34fb")
        val BATTERY_SERVICE_UUID: UUID  =
            UUID.fromString("0000180F-0000-1000-8000-00805F9B34FB")
        val BATTERY_LEVEL_CHARACTERISTIC_UUID: UUID =
            UUID.fromString("00002A19-0000-1000-8000-00805F9B34FB")
        val DEVICE_INFO_SERVICE_UUID: UUID =
            UUID.fromString("0000180A-0000-1000-8000-00805F9B34FB")
        val FIRMWARE_CHARACTERISTIC_UUID: UUID =
            UUID.fromString("00002A26-0000-1000-8000-00805F9B34FB")

        const val BATTERY_LEVEL_CHARACTERISTIC_UUID_STR: String =
            "00002A19-0000-1000-8000-00805F9B34FB"
        const val FIRMWARE_CHARACTERISTIC_UUID_STR: String =
            "00002A26-0000-1000-8000-00805F9B34FB"

        fun bytesToHexString(hashInBytes: ByteArray): String {
            val sb = StringBuilder()
            for (b in hashInBytes) {
                sb.append(String.format("%02x", b))
            }
            return sb.toString()
        }

        fun encrypt(value: ByteArray, key: ByteArray?): ByteArray? {
            return try {
                val cipher: Cipher = Cipher.getInstance("AES/ECB/NoPadding")
                cipher.init(1, SecretKeySpec(key, "AES") as Key)
                cipher.doFinal(value)
            } catch (ex: Exception) {
                ex.printStackTrace()
                null
            }
        }

        fun decrypt(value: ByteArray, key: ByteArray?): ByteArray? {
            return try {
                val cipher: Cipher = Cipher.getInstance("AES/ECB/NoPadding")
                cipher.init(2, SecretKeySpec(key, "AES") as Key)
                cipher.doFinal(value)
            } catch (ex: Exception) {
                ex.printStackTrace()
                null
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        setSupportActionBar(toolbar)

        fab.setOnClickListener { view ->
            ContextCompat.checkSelfPermission(applicationContext,
                "android.permission.ACCESS_FINE_LOCATION");

            val bluetoothManager =
                getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager

            val bluetoothAdapter = bluetoothManager.adapter

            val REQUEST_ENABLE_BLUETOOTH = 0;

            if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled) {
                val enableBtIntent =
                    Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)
                startActivityForResult(enableBtIntent, REQUEST_ENABLE_BLUETOOTH)
            }

            val scanCallback = BluetoothAdapter.LeScanCallback { device, rssi, scanRecord ->
                if (device != null) {
                    val name = device.name;
                    if (name != null && name.toLowerCase(Locale.ROOT).contains("pie")) {
                        val address = device.address
                        device.connectGatt(application.applicationContext,
                            false,
                            PieGattClientCallback())
                    }
                }
            }

            bluetoothAdapter.startLeScan(scanCallback)
        }

    }

    class PieGattClientCallback : BluetoothGattCallback() {
        val key = byteArrayOf(65, 63, 68, 40, 71, 43, 75, 98, 80, 101, 83, 104, 86, 109, 89, 113)

        override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int) {
            if (newState == STATE_CONNECTED){
                gatt.discoverServices();
            }
        }

        override fun onServicesDiscovered(gatt: BluetoothGatt?, status: Int) {
            super.onServicesDiscovered(gatt, status)
            val msmtCharacteristic = gatt?.getService(SERVICE_MEASUREMENT_UUID)?.
                getCharacteristic(CHARACTERISTIC_MEASUREMENT_UUID)
            mySetCharacteristicNotification(gatt, msmtCharacteristic, true)

            val batteryLevelCharacteristic = gatt?.getService(BATTERY_SERVICE_UUID)?.
                getCharacteristic(BATTERY_LEVEL_CHARACTERISTIC_UUID)
            mySetCharacteristicNotification(gatt, batteryLevelCharacteristic, true)

            val firmwareCharacteristic = gatt?.getService(DEVICE_INFO_SERVICE_UUID)?.
                getCharacteristic(FIRMWARE_CHARACTERISTIC_UUID)
            mySetCharacteristicNotification(gatt, firmwareCharacteristic, true)
        }

        private fun mySetCharacteristicNotification(gatt: BluetoothGatt?,
                                                    gattChar: BluetoothGattCharacteristic?,
                                                    enable: Boolean)
        {
            val didSet = gatt?.setCharacteristicNotification(gattChar, enable)
            if (didSet != true) return
            val descriptor = gattChar?.getDescriptor(CLIENT_CHARACTERISTIC_CONFIG_UUID)
            if (descriptor != null) {
                descriptor.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                gatt.writeDescriptor(descriptor)
            }
        }

        override fun onCharacteristicChanged(
            gatt: BluetoothGatt?,
            gattChar: BluetoothGattCharacteristic?
        ) {
            super.onCharacteristicChanged(gatt, gattChar)
            readCharacteristic(gatt!!, gattChar)
        }

        override fun onCharacteristicRead(
            gatt: BluetoothGatt?,
            gattChar: BluetoothGattCharacteristic?,
            something: Int
        ) {
            if (something == 0) {
                readCharacteristic(gatt!!, gattChar)
            }
        }

        private fun readCharacteristic(gatt: BluetoothGatt, gattChar: BluetoothGattCharacteristic?) {
            var value = gattChar?.value!!
            val uuid = gattChar.uuid.toString()

            println("****** READ VALUE: " + bytesToHexString(value))

            if (uuid.toUpperCase(Locale.ROOT) == BATTERY_LEVEL_CHARACTERISTIC_UUID_STR) {
                val level = gattChar.getIntValue(17, 0)
                println("BATTERY LEVEL: " + level)
            }
            if (uuid.toUpperCase(Locale.ROOT) == FIRMWARE_CHARACTERISTIC_UUID_STR) {
                val firmVer = String(value, UTF_8)
                println("FIRMWARE VERSION: " + firmVer)
            }
            if (value.size < 2) {
                return
            }
            if (value[0] == 0xFF.toByte() && value[1] == 0x00.toByte()) {
                val dateStr = "20191020191501"
                val toSend = ArrayList<Byte>()
                toSend.add(0xFF.toByte())
                toSend.add(0x00.toByte())
                toSend.addAll(dateStr.toByteArray(UTF_8).toList())

                println("WRITING DATE")

                val writeCh = gatt.getService(SERVICE_MEASUREMENT_UUID)?.
                    getCharacteristic(CHARACTERISTIC_WRITE_UUID)
                writeCh?.value = toSend.toByteArray()
                writeCh?.writeType = 1
                gatt.writeCharacteristic(writeCh)
            }
//        if (confirmBytes == decrypt(value, key)) {
//          succeed
//        }
//        else {
//          fail //          isConnecting = false
//        }

            value = decrypt(value, key)!!
            if (value[0] == 0xFF.toByte() && value[1] == 0x01.toByte()) {
                if (value.size != 16) {
                    return;
                }
                for (i in 3..14) {
                    value[i] = value[i] xor value[15]
                }
                println("WRITING CONF")
                // confirmDecryptBytes = value
                val encd = encrypt(value, key)
                val writeCh = gatt.getService(SERVICE_MEASUREMENT_UUID)?.
                    getCharacteristic(CHARACTERISTIC_WRITE_UUID)
                writeCh?.value = encd
                writeCh?.writeType = 1
                gatt.writeCharacteristic(writeCh)
            }
            if (value[0] == 0xFF.toByte() && value[1] == 0x02.toByte()) {
                if (value.size != 16) {
                    return;
                }
                val onlyMsmt = Arrays.copyOfRange(value, 2, value.size - 1)
                val onlyMsmtStr = String(onlyMsmt, UTF_8)
                println(onlyMsmtStr)
            }
        }
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.menu_main, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_settings -> true
            else -> super.onOptionsItemSelected(item)
        }
    }


    fun dummy() {
        com.bagellabs.pie.ble.PieManager

    }
}




//            val y = gatt?.setCharacteristicNotification(batteryLevelCharacteristic, true)
//            val batteryDesc = batteryLevelCharacteristic?.getDescriptor(CLIENT_CHARACTERISTIC_CONFIG_UUID)
//            batteryDesc?.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
//            gatt?.writeDescriptor(batteryDesc)